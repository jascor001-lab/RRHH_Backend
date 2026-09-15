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
      'http://localhost:4009',
      'http://127.0.0.1:4009',
      'http://192.168.7.223:4009',
      'https://localhost:4443',
      'https://127.0.0.1:4443',
      'https://192.168.7.223:4443',
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

  const port = process.env.PORT || 4008;

  await app.listen(port);

  console.log(
    `Backend running on port ${port}`,
  );

}

bootstrap();