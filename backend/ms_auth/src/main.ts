import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const restPort = configService.get<number>('REST_PORT') || 3001;
  const grpcPort = configService.get<number>('GRPC_PORT') || 50051;

  const protoPath =
    configService.get<string>('PROTO_AUTH_PATH') ||
    join(process.cwd(), '../../proto/auth.proto');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath,
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  await app.startAllMicroservices();

  await app.listen(restPort);

  console.log(`MS Auth REST running on port ${restPort}`);
  console.log(`MS Auth gRPC running on port ${grpcPort}`);

  /*app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('REST_PORT') || 3001;

  await app.listen(port);
  console.log(`MS Auth REST running on port ${port}`);*/
}

bootstrap();