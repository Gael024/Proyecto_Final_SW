import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocentesAlumnosGrpcController } from './grpc/docentes_alumnos.grpc.controller';
import { AuthClient } from './auth/auth.client';

import { DocentesModule } from './docentes/docentes.module';
import { AlumnosModule } from './alumnos/alumnos.module';

//entitys


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([{
    name: 'AUTH_SERVICE',
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: '/app/proto/auth.proto', 
      //protoPath: '/app/proto/auth.proto',
    },
  },
]),
    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
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

    DocentesModule,
    AlumnosModule,
  ],

  controllers: [
    AppController,
    DocentesAlumnosGrpcController,
  ],

  providers: [
    AppService,
    AuthClient,
  ],

  exports: [AuthClient],
})
export class AppModule {}