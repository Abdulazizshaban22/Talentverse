
import { Controller, Post, Body } from '@nestjs/common';
import { Pool } from 'pg';
import { submitApplicationToTalentera } from './connectors/talentera';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || '' });

@Controller('v1/apply')
export class ApplyController {

  @Post()
  async oneClick(@Body() body: any){
    // body: { person_id, opportunity_id, resume?, coverLetter?, connector? }
    const { person_id, opportunity_id, resume, coverLetter, connector } = body;
    const person = await pool.query('SELECT id, full_name, email, phone, bio FROM person WHERE id=$1', [person_id]);
    const opp = await pool.query('SELECT id, name, region, salary_min, salary_max, currency FROM emb_opportunity_v2 WHERE id=$1', [opportunity_id]);
    if (!person.rows.length || !opp.rows.length){
      return { error: 'person or opportunity not found' };
    }
    const job = opp.rows[0];
    const cand = person.rows[0];
    const payload:any = {
      "@context": "https://schema.org",
      "@type": "JobApplication",
      "applicant": {
        "@type": "Person",
        "name": cand.full_name,
        "email": cand.email,
        "telephone": cand.phone,
        "description": cand.bio
      },
      "jobPosting": {
        "@type": "JobPosting",
        "title": job.name,
        "jobLocation": job.region
      },
      "resume": resume || null,
      "coverLetter": coverLetter || null
    };
    if (job.salary_min){
      payload.jobPosting.baseSalary = {
        "@type":"MonetaryAmount",
        "currency": job.currency || "SAR",
        "value": { "@type":"QuantitativeValue", "minValue": job.salary_min, "maxValue": job.salary_max || job.salary_min }
      };
    }
    // Persist application locally
    const ins = await pool.query('INSERT INTO application(person_id, opportunity_id) VALUES ($1,$2) RETURNING id', [person_id, opportunity_id]);
    let external:any = null;
    if ((connector||'').toLowerCase() === 'talentera' && process.env.TALENTERA_BASE){
      try{
        const out = await submitApplicationToTalentera(payload, { baseUrl: process.env.TALENTERA_BASE as string, apiKey: process.env.TALENTERA_API_KEY });
        external = out?.id || out?.reference || null;
      }catch(e:any){
        external = null;
      }
    }
    if (external){
      await pool.query('UPDATE application SET external_ref=$1 WHERE id=$2', [external, ins.rows[0].id]);
    }
    return { id: ins.rows[0].id, external_ref: external, payload };
  }
}
