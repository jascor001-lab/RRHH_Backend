import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  /**
   * CORS
   */
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3005',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3005',
      'http://192.168.7.223:3005',
      'https://localhost:3443',
      'https://127.0.0.1:3443',
      'https://192.168.7.223:3443',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3004;

  await app.listen(port);

  console.log(
    `Backend running on port ${port}`,
  );

}

bootstrap();