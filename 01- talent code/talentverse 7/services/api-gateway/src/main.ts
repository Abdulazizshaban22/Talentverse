
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { requirePermission } from './authz';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  const server = app.getHttpAdapter().getInstance<express.Express>();
  server.use('/v1/profiles', requirePermission('profile','read'));
  server.use('/v1/institutions', requirePermission('institution','read'));
  await app.listen(process.env.PORT || 8000);
  console.log('API Gateway running on', process.env.PORT || 8000);
}
bootstrap();
