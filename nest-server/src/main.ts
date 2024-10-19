import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://trainingsystemsre.onrender.com',
      ],
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
