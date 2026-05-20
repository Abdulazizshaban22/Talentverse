import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RewardsService } from '../rewards.service';
import { AuthGuard } from '../auth.guard';

@Controller('rewards')
@UseGuards(AuthGuard)
export class RewardsController {
  constructor(private svc: RewardsService){}
  @Get() list(){ return this.svc.list() }
  @Post('redeem')
  redeem(@Body() body: { userId: string; rewardId: string }){ return this.svc.redeem(body.userId, body.rewardId) }
}
