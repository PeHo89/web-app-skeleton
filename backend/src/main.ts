import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import 'reflect-metadata';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  };
  app.use(cors(options));

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
