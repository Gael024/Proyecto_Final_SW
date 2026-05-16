import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';

import { Asistencia } from './entities/asistencia.entity';
import { SesionAsistencia } from '../sesiones/entities/sesion-asistencia.entity';

import { QrService } from '../qr/qr.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

import {
  AsistenciasGrpcController,
} from './asistencias.grpc.controller';



@Module({

  //ESTOS SON LOS IMPORT
  imports: [
    TypeOrmModule.forFeature([
      Asistencia,
      SesionAsistencia,
    ]),

    //OTRO 
    JwtModule.register({
      secret: process.env.JWT_SECRET,

      signOptions: {
        expiresIn: '15s',
      },
    }),


  ],

  //ESTO ESTA FUERA DE LOS IMPORTS

  controllers: [
    AsistenciasController,

    AsistenciasGrpcController,
  ],

  //providers: [AsistenciasService],  //ESTE LO CAMBIOS DEBIO AL MODULO DE QR QUE TODAVIO NO SE IMPLEMENTA
  providers: [
    AsistenciasService,
    QrService,
    RedisService,
  ],

  exports: [
    AsistenciasService
  ],
})
export class AsistenciasModule {}