
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT || 8000);
  console.log('API Gateway running on', process.env.PORT || 8000);
}
bootstrap();
