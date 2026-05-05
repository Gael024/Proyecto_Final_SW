import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from '../app.service';

@Controller()
export class PeriodoGrpcController {
  constructor(private readonly appService: AppService) {}

  // El primer parámetro es el nombre del Servicio en tu .proto
  // El segundo es el nombre exacto del método (rpc)
  @GrpcMethod('PeriodosService', 'GetPeriodoActivo')
  async getPeriodoActivo() {
    try {
      // Usamos el nuevo método que trae también las materias relacionadas
      const periodo = await this.appService.getPeriodoActivoConMaterias();
      
      // Mapeamos las materias al formato esperado por el .proto
      const materiasFormateadas = periodo.materiaPeriodoPlanes ? periodo.materiaPeriodoPlanes.map(mpp => ({
        id: mpp.id,
        nrc: mpp.materia.nrc,
        nombre: mpp.materia.nombre,
        planEstudio: mpp.planEstudio.nombre,
        docenteId: mpp.profesor ? mpp.profesor.id : 0,
      })) : [];

      // Devolvemos la estructura exacta que pide el .proto (PeriodoResponse)
      return {
        id: periodo.id,
        nombre: periodo.nombre,
        fechaInicio: periodo.fecha_inicio.toISOString(),
        fechaFin: periodo.fecha_fin.toISOString(),
        activo: periodo.activo,
        materias: materiasFormateadas,
      };
    } catch (error) {
      // Si no hay periodo activo, devolvemos datos vacíos o un error
      return {
        id: 0,
        nombre: 'Sin periodo activo',
        fechaInicio: '',
        fechaFin: '',
        activo: false,
        materias: [],
      };
    }
  }
}
