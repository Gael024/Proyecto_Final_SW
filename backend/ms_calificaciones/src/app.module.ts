import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { Calificacion } from './calificaciones/entities/calificacion.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(
            __dirname,
            '../../proto/auth.proto',
          ),
          url: process.env.AUTH_GRPC_URL,
        },
      },
      // PERIODOS
      {
        name: 'PERIODOS_SERVICE',
        transport: Transport.GRPC,
        options: {
        package: 'periodos',
          protoPath: join(
            __dirname,
            '../../proto/periodos.proto',
          ),
          url: process.env.PERIODOS_GRPC_URL,
        },
      },

      // DOCENTES-ALUMNOS
      {
        name: 'DOCENTES_ALUMNOS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'docentes_alumnos',
          protoPath: join(
            __dirname,
            '../../proto/docentes_alumnos.proto',
          ),
          url:
            process.env.DOCENTES_ALUMNOS_GRPC_URL,
        },
      },
    ]),

    // TYPEORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:
        (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        }),
    }),

    // MODULOS
    CalificacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
