import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';

interface GetMateriaByIdRequest {
  materiaId: string;
}

interface MateriaResponse {
  id: number;
  nrc: string;
  nombre: string;
  planEstudio: string;
  docenteId: number;
}

interface GetMateriasByDocenteRequest {
  docenteId: number;
}

interface MateriasByDocenteResponse {
  materias: MateriaResponse[];
}

interface PeriodoActivoResponse {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  materias: MateriaResponse[];
}

interface PeriodosService {
  GetPeriodoActivo(data: {}): any;

  GetMateriaById(
    data: GetMateriaByIdRequest,
  ): any;

  GetMateriasByDocente(
    data: GetMateriasByDocenteRequest,
  ): any;
}

@Injectable()
export class PeriodosClient
  implements OnModuleInit
{
  private periodosService: PeriodosService;

  constructor(
    @Inject('PERIODOS_SERVICE')
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.periodosService =
      this.client.getService<PeriodosService>(
        'PeriodosService',
      );
  }

  async getPeriodoActivo(): Promise<PeriodoActivoResponse> {
    return firstValueFrom(
      this.periodosService.GetPeriodoActivo({}),
    );
  }

  async getMateriaById(
    materiaId: string,
  ): Promise<MateriaResponse> {
    return firstValueFrom(
      this.periodosService.GetMateriaById({
        materiaId,
      }),
    );
  }

  async getMateriasByDocente(
    docenteId: number,
  ): Promise<MateriasByDocenteResponse> {
    return firstValueFrom(
      this.periodosService.GetMateriasByDocente({
        docenteId,
      }),
    );
  }
}