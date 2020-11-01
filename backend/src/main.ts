import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.BACKEND_PORT || 3000;

  try {
    await app.listen(port);
  } catch (error) {
    Logger.error(error.message, error.trace, 'MAIN');
  }

  Logger.log(
    `${process.env.APP_NAME || 'app'} started on port ${port}`,
    'MAIN',
  );
}
bootstrap();
