
import { Controller, Post, Body } from '@nestjs/common';

@Controller('profiles')
export class TalentController {
  @Post()
  upsert(@Body() payload: any) {
    // TODO: persist to Postgres, audit consent if given
    return { status: 'ok', id: payload.id || 'temp-id', received: payload };
  }
}
