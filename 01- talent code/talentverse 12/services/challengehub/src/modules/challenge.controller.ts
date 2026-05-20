
import { Controller, Post, Body } from '@nestjs/common';

@Controller('challenges')
export class ChallengeController {
  @Post(':id/submit')
  submit(@Body() payload: any) {
    return { status: 'submitted', payload };
  }
}
