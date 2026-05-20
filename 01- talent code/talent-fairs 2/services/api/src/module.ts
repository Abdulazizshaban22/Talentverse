import { Module } from '@nestjs/common';
import { HealthController } from './routes/health';
import { PointsController } from './routes/points';
import { RewardsController } from './routes/rewards';
import { RewardsService } from './rewards.service';

@Module({ controllers: [HealthController, PointsController, RewardsController], providers:[RewardsService] })
export class AppModule {}
