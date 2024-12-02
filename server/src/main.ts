import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.useLogger(['log', 'error', 'warn', 'debug']);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.use(
    cors({
      origin: [process.env.DEV_BASE_URL, process.env.PROD_BASE_URL],
      methods: 'GET,POST,PUT,DELETE,PATCH',
      credentials: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
