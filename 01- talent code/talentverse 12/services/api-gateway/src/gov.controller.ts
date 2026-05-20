
import { Controller, Get, Query } from '@nestjs/common';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL || '' });

@Controller('v1/gov')
export class GovController {
  @Get('stats/edu')
  async edu(){
    const r = await pool.query(`
      SELECT region, COUNT(*) AS students, round(avg(gpa)::numeric,2) AS avg_gpa
      FROM edu_student GROUP BY region ORDER BY region
    `);
    return { rows: r.rows };
  }
  @Get('stats/sports')
  async sports(@Query('type') t?:string){
    const r = await pool.query(`
      SELECT a.region, COUNT(*) AS athletes
      FROM sport_athlete a GROUP BY a.region ORDER BY a.region
    `);
    return { rows: r.rows };
  }
  @Get('stats/hr')
  async hr(){
    const r = await pool.query(`
      SELECT region, COUNT(*) AS employees, round(avg(score)::numeric,2) AS avg_perf
      FROM hr_employee e LEFT JOIN hr_performance p ON p.employee_nid = e.national_id
      GROUP BY region ORDER BY region
    `);
    return { rows: r.rows };
  }
}
