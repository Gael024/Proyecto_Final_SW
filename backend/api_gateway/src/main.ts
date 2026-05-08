import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, //Permite paso de parametros sin definir en el DTO. Vañidación estricta en cada microservicio
      transform: true,
    }),
  );

  app.enableCors();
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`API Gateway ejecutandose en puerto ${port}`);
}
bootstrap();
