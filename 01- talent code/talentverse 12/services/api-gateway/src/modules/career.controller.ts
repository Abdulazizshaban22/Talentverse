
import { Controller, Post, Body } from '@nestjs/common';

@Controller('career')
export class CareerController {
  @Post('recommend')
  recommend(@Body() payload: any) {
    return { topN: [{ path: 'Computer Science - AI Track', score: 0.78 }], inputs: payload };
  }
}
