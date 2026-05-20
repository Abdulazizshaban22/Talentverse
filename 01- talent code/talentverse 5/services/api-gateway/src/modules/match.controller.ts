
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { pool } from '../db';

@Controller('match')
export class MatchController {
  @Post()
  async run(@Body() payload: any, @Headers('x-ab-engine') ab?: string) {
    const engine = (ab || 'v1').toLowerCase(); // v1 simple | v2 ner+emb
    let results: any[] = [];
    if (engine === 'v2') {
      // delegate to AI service (ner+emb) in future; returning stub for now
      results = [{ opportunity: 'National Coding Cup', score: 0.91 }];
    } else {
      // simple features-based
      results = [{ opportunity: 'National Coding Cup', score: 0.87 }];
    }
    // log A/B event
    try {
      await pool.query('INSERT INTO ab_event (user_id, engine, input, output) VALUES ($1,$2,$3,$4)',
        [payload?.profile?.id || null, engine, payload, { results }]);
    } catch(e) { /* ignore in dev */ }
    return { results, engine };
  }
}
