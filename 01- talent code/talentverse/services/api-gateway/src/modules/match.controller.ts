
import { Controller, Post, Body } from '@nestjs/common';

@Controller('match')
export class MatchController {
  @Post()
  run(@Body() payload: any) {
    // Proxy to ai-talentmatch (or implement simple scoring)
    return { results: [{ opportunity: 'National Coding Cup', score: 0.87 }], debug: { features: payload } };
  }
}
