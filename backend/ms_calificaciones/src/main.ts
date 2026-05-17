import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import {
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // VALIDACIONES
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.enableCors();
  // PUERTOS
  const restPort =
    configService.get<number>('REST_PORT') || 3004;

  const grpcPort =
    configService.get<number>('GRPC_PORT') || 50054;

  // PROTO
  const protoPath = '/app/proto/calificaciones.proto';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'calificaciones', 
      protoPath,
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  // INICIAR MICROSERVICIOS
  await app.startAllMicroservices();
  await app.listen(restPort);
  console.log(
    `MS Calificaciones REST running on port ${restPort}`,
  );
  console.log(
    `MS Calificaciones gRPC running on port ${grpcPort}`,
  );

}
bootstrap();
