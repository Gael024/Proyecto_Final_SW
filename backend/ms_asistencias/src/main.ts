import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { Transport }
  from '@nestjs/microservices';

import { join } from 'path';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.connectMicroservice({

    transport: Transport.GRPC,

    options: {

      package: 'asistencias',

    protoPath: join(
    __dirname,
      '../proto/asistencias.proto',
    ),

      url: '0.0.0.0:50055',
    },
  });

  await app.startAllMicroservices();

  await app.listen(
    process.env.PORT ?? 3005,
  );

  console.log(
    'MS Asistencias corriendo',
  );
}

bootstrap();