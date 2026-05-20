import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT_API || 4000);
  // eslint-disable-next-line no-console
  console.log('API listening on', process.env.PORT_API || 4000);
}
bootstrap();
