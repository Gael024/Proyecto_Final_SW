import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CalificacionesService } from './calificaciones.service';

@Controller('calificaciones')
export class CalificacionesController {
    constructor(
    private readonly calificacionesService:
      CalificacionesService,
  ) {}

  @GrpcMethod(
    'CalificacionesService',
    'RegistrarCalificacion',
  )
  registrarCalificacion(data: any) {

    return this.calificacionesService
      .registrarCalificacion(data);
  }
}
