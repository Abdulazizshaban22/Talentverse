
import { Controller, Post, Body } from '@nestjs/common';
import axios from 'axios';

@Controller('match/person')
export class MatchPersonController {
  @Post()
  async run(@Body() payload: any) {
    // forwards to ai-talentmatch with person_id (expects DATABASE_URL env configured there)
    const base = process.env.TM_URL || 'http://localhost:8010';
    const r = await axios.post(base + '/v1/match', payload, { timeout: 15000 });
    return r.data;
  }
}
