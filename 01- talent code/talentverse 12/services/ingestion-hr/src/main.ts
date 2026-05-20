
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Post, Body } from '@nestjs/common';
import { Pool } from 'pg';
import amqplib from 'amqplib';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || '' });
const API_KEY = process.env.INGESTION_API_KEY || 'changeme';
const MQ_URL = process.env.MQ_URL || 'amqp://rabbitmq:5672';

let mqConn: amqplib.Connection;
let mqChan: amqplib.Channel;

async function mqEnsure(){
  if (!mqConn) mqConn = await amqplib.connect(MQ_URL);
  if (!mqChan) mqChan = await mqConn.createChannel();
}

function checkKey(headers:any){
  const k = headers['x-api-key'];
  if(!k || k !== API_KEY) throw new Error('invalid api key');
}

@Controller('v1/hr')
class HrController {
  @Post('employees')
  async employees(@Body() body: any){
    checkKey((body && (body.headers||{})) || {});
    const res = await upsertEmployees(body);
    await publish('hr.employee.upsert', body);
    return res;
  }
  @Post('performance')
  async performance(@Body() body: any){
    checkKey((body && (body.headers||{})) || {});
    const res = await upsertPerformance(body);
    await publish('hr.performance.upsert', body);
    return res;
  }
}

async function publish(topic:string, payload:any){
  await mqEnsure();
  await mqChan.assertExchange('talentverse', 'topic', { durable: true });
  mqChan.publish('talentverse', topic, Buffer.from(JSON.stringify(payload)));
}

async function upsertEmployees(items:any[]){
  const client = await pool.connect();
  try{
    for(const e of items){
      await client.query(`
        INSERT INTO hr_employee (national_id, full_name, email, phone, region, institution_id, title, grade, department)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (national_id) DO UPDATE SET
          full_name=EXCLUDED.full_name, email=EXCLUDED.email, phone=EXCLUDED.phone,
          region=EXCLUDED.region, institution_id=EXCLUDED.institution_id,
          title=EXCLUDED.title, grade=EXCLUDED.grade, department=EXCLUDED.department
      `,[e.national_id, e.full_name, e.email, e.phone, e.region, e.institution_id, e.title, e.grade, e.department]);
    }
    return { ok: true, n: items.length };
  } finally { client.release(); }
}

async function upsertPerformance(items:any[]){
  const client = await pool.connect();
  try{
    for(const p of items){
      await client.query(`
        INSERT INTO hr_performance (employee_nid, period, score, notes)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (employee_nid, period) DO UPDATE SET score=EXCLUDED.score, notes=EXCLUDED.notes
      `,[p.employee_nid, p.period, p.score, p.notes||null]);
    }
    return { ok: true, n: items.length };
  } finally { client.release(); }
}

@Module({ controllers: [HrController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req:any,res:any,next:any)=>{ try{ checkKey(req.headers); next(); } catch(e){ res.status(401).json({error:'invalid api key'});} });
  await app.listen(process.env.PORT || 8062);
}
bootstrap();
