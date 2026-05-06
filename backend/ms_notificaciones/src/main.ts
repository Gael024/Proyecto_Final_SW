import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService} from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';


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

  const restPort = configService.get<number>('REST_PORT') || 3006;
  const grpcPort = configService.get<number>('GRPC_PORT') || 50056;

  const protoPath = 
    configService.get<string>('PROTO_NOTIFICACIONES_PATH') ||
    join(process.cwd(), '../../proto/notificaciones.proto');
    
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notificaciones',
      protoPath,
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(restPort);

  console.log(`MS de notificaciones REST ejecutandose en puerto ${restPort}`);
  console.log(`MS de notificaciones gRPC ejecutandose en puerto ${grpcPort}`);
}
bootstrap();
