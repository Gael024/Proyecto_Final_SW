import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CalificacionesService } from '../calificaciones.service';

@Controller()
export class CalificacionesGrpcController {

  constructor(
    private readonly calificacionesService:
      CalificacionesService,
  ) {}

  @GrpcMethod(
    'CalificacionesService',
    'RegistrarCalificacion',
  )
  async registrarCalificacion(data: any) {

    return await this.calificacionesService
      .registrarCalificacion(data);
  }
}