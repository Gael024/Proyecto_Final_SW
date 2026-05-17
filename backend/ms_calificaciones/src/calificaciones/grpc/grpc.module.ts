import { Module } from '@nestjs/common';

import { CalificacionesModule } from '../calificaciones.module';

import { CalificacionesGrpcController } from './calificaciones.grpc.controller';

@Module({
  imports: [
    CalificacionesModule,
  ],
  controllers: [
    CalificacionesGrpcController,
  ],
})
export class GrpcModule {}