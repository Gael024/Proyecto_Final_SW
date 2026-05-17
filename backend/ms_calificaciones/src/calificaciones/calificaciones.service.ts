import { Injectable, NotFoundException, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';  // ← Observable faltaba
import * as XLSX from 'xlsx';
import { Express } from 'express';

import { Actividad } from './entities/actividad.entity';
import { Calificacion } from './entities/calificacion.entity';
import { Ponderacion } from './entities/ponderacion.entity';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';

interface AlumnoGrpc {
  matricula: number;
  nombre: string;
  correo: string;
}

interface DocentesAlumnosGrpcService {
  getAlumnosByMateria(data: { materiaId: number }): Observable<{ alumnos: AlumnoGrpc[] }>;
}
interface ActividadConcentrado {
  actividadId: number;
  nombre: string;
  categoria: string;
  puntosMaximos: number;
  fechaEntrega: Date;
  calificacion: number;
  comentario: string;
  estado: string;
}

interface AlumnoConcentrado {
  alumnoId: number;
  materiaId: number;
  actividades: ActividadConcentrado[];
  promedio: number;
}

@Injectable()
export class CalificacionesService implements OnModuleInit {  // ← implements OnModuleInit
  
   private docentesAlumnosService!: DocentesAlumnosGrpcService;

  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>,

    @InjectRepository(Calificacion)
    private readonly calificacionRepo: Repository<Calificacion>,

    @InjectRepository(Ponderacion)
    private readonly ponderacionRepo: Repository<Ponderacion>,

    @Inject('DOCENTES_ALUMNOS_PACKAGE')
    private client: ClientGrpc,
  ) {}

  // ← esto faltaba completamente
   onModuleInit() {
    this.docentesAlumnosService =
      this.client.getService<DocentesAlumnosGrpcService>(
        'Docentes_AlumnosService',
      );
  }
  private normalize(value: string): string {
    return value
      ?.toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Ponderaciones
  async getPonderaciones(materiaId: number) {
    const ponderaciones = await this.ponderacionRepo.find({ where: { materiaId } });
    return { success: true, data: ponderaciones, message: 'Ponderaciones obtenidas correctamente' };
  }

  async crearPonderacion(data: Partial<Ponderacion>) {
    const total = await this.ponderacionRepo.find({ where: { materiaId: data.materiaId } });
    const sumaActual = total.reduce((acc, item) => acc + item.porcentaje, 0);
    const nuevoTotal = sumaActual + Number(data.porcentaje);
    if (nuevoTotal > 100) {
      throw new BadRequestException('La suma de ponderaciones excede 100%');
    }
    const ponderacion = this.ponderacionRepo.create({
      materiaId: data.materiaId,
      categoria: data.categoria,
      porcentaje: data.porcentaje,
    });
    await this.ponderacionRepo.save(ponderacion);
    return { success: true, data: ponderacion, message: 'Ponderación creada correctamente' };
  }

  async actualizarPonderaciones(materiaId: number, data: Partial<Ponderacion>[]) {
    const suma = data.reduce((acc, item) => acc + (item.porcentaje || 0), 0);
    if (suma !== 100) {
      throw new BadRequestException('Las ponderaciones deben sumar 100%');
    }
    await this.ponderacionRepo.delete({ materiaId });
    const nuevas = data.map(item =>
      this.ponderacionRepo.create({
        materiaId,
        categoria: item.categoria,
        porcentaje: item.porcentaje,
      }),
    );
    await this.ponderacionRepo.save(nuevas);
    return { success: true, data: nuevas, message: 'Ponderaciones actualizadas correctamente' };
  }

  // Actividades
  async crearActividad(data: Partial<Actividad>) {
    const actividad = this.actividadRepo.create({
      materiaId: data.materiaId,
      nombre: data.nombre,
      categoria: data.categoria,
      puntosMaximos: data.puntosMaximos,
      fechaEntrega: data.fechaEntrega,
    });
    await this.actividadRepo.save(actividad);
    return { success: true, data: actividad, message: 'Actividad creada correctamente' };
  }

  // Calificaciones - Manual
  private async validarActividad(actividadId: number) {
    const actividad = await this.actividadRepo.findOneBy({ id: actividadId });
    if (!actividad) {
      throw new NotFoundException('La actividad no existe');
    }
    return actividad;
  }

  async registrarCalificacion(data: CreateCalificacionDto) {
    const actividad = await this.validarActividad(data.actividadId);
    if (data.calificacion > actividad.puntosMaximos) {
      throw new BadRequestException('La calificación excede el máximo permitido');
    }

    const existe = await this.calificacionRepo.findOne({
      where: { alumnoId: data.alumnoId, actividadId: data.actividadId },
    });

    if (existe) {
      existe.calificacion = data.calificacion;
      existe.comentario = data.comentario || '';
      await this.calificacionRepo.save(existe);
      return { success: true, data: existe, message: 'Calificación actualizada correctamente' };
    }

    const nuevaCalificacion = this.calificacionRepo.create({
      alumnoId: data.alumnoId,
      materiaId: data.materiaId,
      actividadId: data.actividadId,
      calificacion: data.calificacion,
      comentario: data.comentario,
    });
    await this.calificacionRepo.save(nuevaCalificacion);
    return { success: true, data: nuevaCalificacion, message: 'Calificación registrada correctamente' };
  }

  // Calificaciones - Excel
  async importarCalificaciones(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo Excel');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    });

    // Filtrar encabezados y filas vacías
    const dataRows = rows.filter((row) => {
      const tarea = this.normalize(String(row['__EMPTY_6'] || ''));
      const correo = this.normalize(String(row['__EMPTY_5'] || ''));

      return (
        tarea &&
        correo &&
        tarea !== 'tareas' &&
        correo !== 'direccion de correo'
      );
    });

    if (!dataRows.length) {
      throw new BadRequestException(
        'El archivo no contiene datos válidos',
      );
    }

    // Obtener actividades activas
    const actividades = await this.actividadRepo.find({
      where: { activa: true },
    });

    const actividadMap = new Map(
      actividades.map((a) => [
        this.normalize(a.nombre),
        a,
      ]),
    );

    // Detectar materia usando la primera actividad válida
    let materiaId: number | null = null;

    for (const row of dataRows) {
      const actividadNombre = this.normalize(
        String(row['__EMPTY_6'] || ''),
      );

      const actividad = actividadMap.get(actividadNombre);

      if (actividad) {
        materiaId = actividad.materiaId;
        break;
      }
    }

    if (!materiaId) {
      throw new BadRequestException(
        'No se encontraron actividades registradas en la BD',
      );
    }

    // Obtener alumnos vía gRPC
    const { alumnos } = await firstValueFrom(
      this.docentesAlumnosService.getAlumnosByMateria({
        materiaId,
      }),
    );
    console.log(
      alumnos.map(a => ({
        matricula: a.matricula,
        correo: a.correo,
      }))
    );

    const alumnoEmailMap = new Map(
      alumnos
        .filter((a) => a.correo)
        .map((a) => [
          this.normalize(a.correo),
          a.matricula,
        ]),
    );

    // Obtener calificaciones existentes
    const existentes = await this.calificacionRepo.find();

    const calificacionMap = new Map(
      existentes.map((c) => [
        `${c.alumnoId}-${c.actividadId}`,
        c,
      ]),
    );

    const nuevas: Calificacion[] = [];
    const actualizaciones: Calificacion[] = [];

    for (const row of dataRows) {
      const actividadNombre = this.normalize(
        String(row['__EMPTY_6'] || ''),
      );

      const actividad = actividadMap.get(actividadNombre);

      if (!actividad) {
        console.log(
          'Actividad no encontrada:',
          actividadNombre,
        );
        continue;
      }

      const correo = this.normalize(
        String(row['__EMPTY_5'] || ''),
      );

      const alumnoId = alumnoEmailMap.get(correo);

      if (!alumnoId) {
        console.log(
          'Alumno no encontrado:',
          correo,
        );
        continue;
      }

      const calificacionValue = Number(
        row['__EMPTY_11'],
      );

      if (isNaN(calificacionValue)) {
        console.log(
          'Calificación inválida:',
          row['__EMPTY_11'],
        );
        continue;
      }

      const comentario = String(
        row['__EMPTY_10'] || '',
      );

      const key = `${alumnoId}-${actividad.id}`;

      const existente = calificacionMap.get(key);

      if (existente) {
        existente.calificacion = calificacionValue;
        existente.comentario = comentario;

        actualizaciones.push(existente);
      } else {
        nuevas.push(
          this.calificacionRepo.create({
            alumnoId,
            materiaId: actividad.materiaId,
            actividadId: actividad.id,
            calificacion: calificacionValue,
            comentario,
          }),
        );
      }
    }

    if (actualizaciones.length > 0) {
      await this.calificacionRepo.save(actualizaciones);
    }

    if (nuevas.length > 0) {
      await this.calificacionRepo.save(nuevas);
    }

    return {
      success: true,
      data: {
        nuevas: nuevas.length,
        actualizadas: actualizaciones.length,
      },
      message: 'Calificaciones importadas correctamente',
    };
  }

  // Concentrado
  // Concentrado
  async getConcentrado(materiaId: number) {

    const calificaciones = await this.calificacionRepo.find({
      where: { materiaId },
      relations: ['actividad'],
      order: {
        alumnoId: 'ASC',
        actividadId: 'ASC',
      },
    });

    // Obtener ponderaciones
    const ponderaciones = await this.ponderacionRepo.find({
      where: { materiaId },
    });

    const ponderacionMap = new Map(
      ponderaciones.map((p) => [
        this.normalize(p.categoria),
        p.porcentaje,
      ]),
    );

    const concentrado: any[] = calificaciones.reduce((acc, item) => {

      let alumno = acc.find(
        (a) =>
          a.alumnoId === item.alumnoId &&
          a.materiaId === item.materiaId,
      );

      if (!alumno) {
        alumno = {
          alumnoId: item.alumnoId,
          materiaId: item.materiaId,
          actividades: [],
          promedio: 0,
        };

        acc.push(alumno);
      }

      alumno.actividades.push({
        actividadId: item.actividad.id,
        nombre: item.actividad.nombre,
        categoria: item.actividad.categoria,
        puntosMaximos: item.actividad.puntosMaximos,
        fechaEntrega: item.actividad.fechaEntrega,
        calificacion: Number(item.calificacion),
        comentario: item.comentario,
        estado: item.estado,
      });

      return acc;

        },
      [] as any[],
    );

    // Calcular promedio ponderado
    concentrado.forEach((alumno) => {

      const categorias: Record<
        string,
        {
          suma: number;
          cantidad: number;
          ponderacion: number;
        }
      > = {};

      // Agrupar actividades por categoría
      alumno.actividades.forEach((actividad) => {

        const categoria = this.normalize(
          actividad.categoria,
        );

        if (!categorias[categoria]) {
          categorias[categoria] = {
            suma: 0,
            cantidad: 0,
            ponderacion:
              ponderacionMap.get(categoria) || 0,
          };
        }

        categorias[categoria].suma +=
          actividad.calificacion;

        categorias[categoria].cantidad += 1;
      });

      let promedioFinal = 0;

      // Aplicar ponderaciones
      Object.keys(categorias).forEach((categoria) => {

        const data = categorias[categoria];

        const promedioCategoria =
          data.cantidad > 0
            ? data.suma / data.cantidad
            : 0;

        promedioFinal +=
          promedioCategoria *
          (data.ponderacion / 100);
      });

      alumno.promedio = Number(
        promedioFinal.toFixed(2),
      );
    });

    return {
      success: true,
      data: concentrado,
      message: 'Concentrado obtenido correctamente',
    };
  }
  //Metodos GRPC
  //GetPromedioAlumno
  async getPromedioAlumno(alumnoId: number, materiaId: number) {
    const calificaciones = await this.calificacionRepo.find({
      where: { alumnoId, materiaId },
      relations: ['actividad'],
    });
    if (!calificaciones.length) {
      return { success: false, promedio: 0, message: 'No hay calificaciones para este alumno' };
    }
    const ponderaciones = await this.ponderacionRepo.find({ where: { materiaId } });
    const ponderacionMap = new Map(
      ponderaciones.map((p) => [this.normalize(p.categoria), p.porcentaje]),
    );
    // Misma lógica que getConcentrado pero para un solo alumno
    const categorias: Record<string, { suma: number; cantidad: number; ponderacion: number }> = {};
    calificaciones.forEach(({ actividad, calificacion }) => {
      const cat = this.normalize(actividad.categoria);
      if (!categorias[cat]) {
        categorias[cat] = { suma: 0, cantidad: 0, ponderacion: ponderacionMap.get(cat) || 0 };
      }
      categorias[cat].suma += Number(calificacion);
      categorias[cat].cantidad += 1;
    });
    let promedio = 0;
    Object.values(categorias).forEach(({ suma, cantidad, ponderacion }) => {
      promedio += (cantidad > 0 ? suma / cantidad : 0) * (ponderacion / 100);
    });
    return {
      success: true,
      promedio: Number(promedio.toFixed(2)),
      message: 'Promedio obtenido correctamente',
    };
  }
  //GetEstadisticasMateria
  async getEstadisticasMateria(materiaId: number) {
  const calificaciones = await this.calificacionRepo.find({
    where: { materiaId },
    relations: ['actividad'],
  });

  if (!calificaciones.length) {
    return {
      success: false,
      promedioGeneral: 0,
      totalAlumnos: 0,
      totalActividades: 0,
      calificacionMax: 0,
      calificacionMin: 0,
      porCategoria: [],
      message: 'No hay calificaciones registradas',
    };
  }

  // Alumnos y actividades únicos
  const alumnosUnicos     = new Set(calificaciones.map((c) => c.alumnoId));
  const actividadesUnicas = new Set(calificaciones.map((c) => c.actividadId));

  const valores = calificaciones.map((c) => Number(c.calificacion));
  const calificacionMax = Math.max(...valores);
  const calificacionMin = Math.min(...valores);

  // Estadísticas por categoría
  const catMap: Record<string, { suma: number; valores: number[]; alumnos: Set<number> }> = {};

  calificaciones.forEach(({ actividad, calificacion, alumnoId }) => {
    const cat = this.normalize(actividad.categoria);
    if (!catMap[cat]) catMap[cat] = { suma: 0, valores: [], alumnos: new Set() };
    catMap[cat].suma += Number(calificacion);
    catMap[cat].valores.push(Number(calificacion));
    catMap[cat].alumnos.add(alumnoId);
  });

  const porCategoria = Object.entries(catMap).map(([categoria, data]) => ({
    categoria,
    promedio:        Number((data.suma / data.valores.length).toFixed(2)),
    calificacionMax: Math.max(...data.valores),
    calificacionMin: Math.min(...data.valores),
    totalAlumnos:    data.alumnos.size,
  }));

  const promedioGeneral = Number(
    (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2),
  );

  return {
    success: true,
    promedioGeneral,
    totalAlumnos:     alumnosUnicos.size,
    totalActividades: actividadesUnicas.size,
    calificacionMax,
    calificacionMin,
    porCategoria,
    message: 'Estadísticas obtenidas correctamente',
  };
}

}