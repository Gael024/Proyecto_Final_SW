import { Controller } from '@nestjs/common';

import { GrpcMethod } from '@nestjs/microservices';

import { AsistenciasService }
  from './asistencias.service';

@Controller()
export class AsistenciasGrpcController {

  constructor(
    private readonly asistenciasService:
      AsistenciasService,
  ) {}

  @GrpcMethod(
    'AsistenciasService',
    'GetAsistenciaAlumno',
  )
  async getAsistenciaAlumno(
    data: {
      alumnoId: number;
      materiaId: number;
    },
  ) {

    const asistencias =
      await this
        .asistenciasService
        .obtenerHistorialAlumno(
          data.alumnoId,
          data.materiaId,
        );

    return {
      asistencias,
    };
  }

  @GrpcMethod(
    'AsistenciasService',
    'GetEstadisticasAsistencia',
  )
  async getEstadisticas(
    data: {
      materiaId: number;
    },
  ) {

    return await this
      .asistenciasService
      .obtenerAsistenciasHoy(
        data.materiaId,
      );
  }
}