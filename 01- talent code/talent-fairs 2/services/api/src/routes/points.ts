import { Controller, Post, Body } from '@nestjs/common';
@Controller('points')
export class PointsController {
  @Post('award')
  award(@Body() body: { userId: string; delta: number; reason?: string; }) {
    // TODO: persist via Prisma
    return { ok: true, ...body };
  }
}
