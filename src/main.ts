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
      'http://localhost:3004',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3004',
      'http://192.168.7.223:3004',
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

  const port = process.env.PORT || 3007;

  await app.listen(port);

  console.log(
    `Backend running on port ${port}`,
  );

}

bootstrap();