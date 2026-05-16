import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asistencia } from './asistencias/entities/asistencia.entity';
import { SesionAsistencia } from './sesiones/entities/sesion-asistencia.entity';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { QrService } from './qr/qr.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),

        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),

        database: configService.get('DB_NAME'),

        entities: [
          Asistencia,
          SesionAsistencia,
        ],

        synchronize: true,
      }),
    }),

    

    AsistenciasModule,

    SesionesModule,
  ],


})
export class AppModule {}

//  synchronize: true "Hace que TypeORM cree las tablas automaticamente"
