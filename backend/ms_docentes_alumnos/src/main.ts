import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 🔹 Validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  // 🔹 Puertos
  const restPort = configService.get<number>('REST_PORT') || 3003;
  const grpcPort = configService.get<number>('GRPC_PORT') || 50053;

  // 🔹 Ruta del proto (ajústala si es necesario)
  const protoPath =
    configService.get<string>('PROTO_MS3_PATH') ||
    join(__dirname, '../../../proto/docentes_alumnos.proto')

  // 🔹 gRPC (TU microservicio)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'docentes_alumnos', 
      protoPath,
      url: `0.0.0.0:${grpcPort}`,
    },
  });
  // 🔹 Iniciar microservicios
  await app.startAllMicroservices();

  // 🔹 Iniciar REST
  await app.listen(restPort);
  console.log(`MS Docentes-Alumnos REST running on port ${restPort}`);
  console.log(`MS Docentes-Alumnos gRPC running on port ${grpcPort}`);
}

bootstrap();