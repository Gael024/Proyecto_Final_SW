import { Module } from '@nestjs/common';

import { GrpcMethod } from '@nestjs/microservices';
import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';

@Module({
  controllers: [CalificacionesController],
  providers: [CalificacionesService]
})
export class CalificacionesModule {}
