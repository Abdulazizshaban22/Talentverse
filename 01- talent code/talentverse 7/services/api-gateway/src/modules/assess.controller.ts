
import { Controller, Post, Body } from '@nestjs/common';

@Controller('assess')
export class AssessController {
  @Post('run')
  run(@Body() payload: any) {
    return { sessionId: 'sess_123', scores: { cognitive: 112, emotional: 68 } };
  }
}
