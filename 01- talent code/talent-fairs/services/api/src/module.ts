import { Module } from '@nestjs/common';
import { HealthController } from './routes/health';
import { PointsController } from './routes/points';
@Module({ controllers: [HealthController, PointsController] })
export class AppModule {}
