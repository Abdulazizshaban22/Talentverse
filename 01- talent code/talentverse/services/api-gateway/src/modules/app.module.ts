
import { Module } from '@nestjs/common';
import { TalentController } from './talent.controller';
import { MatchController } from './match.controller';
import { CareerController } from './career.controller';
import { AssessController } from './assess.controller';

@Module({
  controllers: [TalentController, MatchController, CareerController, AssessController],
})
export class AppModule {}
