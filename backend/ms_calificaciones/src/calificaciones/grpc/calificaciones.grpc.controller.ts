import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CalificacionesService } from '../calificaciones.service';

interface MateriaRequest      { materiaId: number; }
interface AlumnoMateriaRequest { alumnoId: number; materiaId: number; }

@Controller()
export class CalificacionesGrpcController {

  constructor(private readonly calificacionesService:CalificacionesService) {}
  //GetConcentrado 
  @GrpcMethod('CalificacionesService', 'GetConcentrado')
  async getConcentrado({ materiaId }: MateriaRequest) {
    return this.calificacionesService.getConcentrado(materiaId);
  }
  //Get Promedio del Alumno
  @GrpcMethod('CalificacionesService', 'GetPromedioAlumno')
  async getPromedioAlumno({ alumnoId, materiaId }: AlumnoMateriaRequest) {
    return this.calificacionesService.getPromedioAlumno(alumnoId, materiaId);
  }
  //GetEstadisticasMateria
  async getEstadisticasMateria({ materiaId }: MateriaRequest) {
    return this.calificacionesService.getEstadisticasMateria(materiaId);
  }
}