import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SesionesController } from './sesiones.controller';
import { SesionesService } from './sesiones.service';

import { SesionAsistencia } from './entities/sesion-asistencia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SesionAsistencia,
    ]),
  ],

  controllers: [SesionesController],

  providers: [SesionesService],

  exports: [SesionesService],
})
export class SesionesModule {}