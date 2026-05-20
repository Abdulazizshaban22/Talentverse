
import { Module } from '@nestjs/common';
import { GovController } from '../gov.controller';
import { VerifyController } from '../verify.controller';
import { ApplyController } from '../apply.controller';
import { SalaryController } from '../salary.controller';
import { ProfileController } from '../profile.controller';
import { QbeController } from '../qbe.controller';

@Module({
  controllers: [GovController, VerifyController, ApplyController, SalaryController, ProfileController, QbeController],
  providers: [],
})
export class AppModule {}
