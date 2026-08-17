import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  /**
   * CORS
   */
  app.enableCors({

    origin: [
      'http://localhost:3001',
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

  await app.listen(3006);

  console.log(
    'Backend running on port 3006',
  );

}

bootstrap();