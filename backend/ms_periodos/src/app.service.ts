import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Periodo } from './entities/periodo.entity';
import { Materia } from './entities/materia.entity';
import { MateriaPeriodoPlan } from './entities/materia-periodo-plan.entity';
import { PlanEstudio } from './entities/plan-estudio.entity';
import { Profesor } from './entities/profesor.entity';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';

// Interfaz para las filas parseadas del PDF
interface MateriaRow {
  nrc: string;
  clave: string;
  nombre: string;
  seccion: string;
  profesor: string;
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(MateriaPeriodoPlan)
    private readonly materiaPeriodoPlanRepository: Repository<MateriaPeriodoPlan>,
    @InjectRepository(PlanEstudio)
    private readonly planEstudioRepository: Repository<PlanEstudio>,
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
  ) { }

  async getMaterias(periodoId: number): Promise<MateriaPeriodoPlan[]> {
    return this.materiaPeriodoPlanRepository.find({
      where: {
        periodo: { id: periodoId },
      },
      relations: ['materia'],
    });
  }

  async createPeriodo(createPeriodoDto: CreatePeriodoDto): Promise<Periodo> {
    if (createPeriodoDto.activo) {
      const periodosActivos = await this.periodoRepository.find({ where: { activo: true } });
      for (const p of periodosActivos) {
        p.activo = false;
        await this.periodoRepository.save(p);
      }
    }
    const nuevoPeriodo = this.periodoRepository.create(createPeriodoDto);
    return await this.periodoRepository.save(nuevoPeriodo);
  }

  async updatePeriodo(id: number, updatePeriodoDto: UpdatePeriodoDto): Promise<Periodo> {
    if (updatePeriodoDto.activo) {
      const periodosActivos = await this.periodoRepository.find({ where: { activo: true } });
      for (const p of periodosActivos) {
        if (p.id !== id) {
          p.activo = false;
          await this.periodoRepository.save(p);
        }
      }
    }
    await this.periodoRepository.update(id, updatePeriodoDto);
    const updated = await this.periodoRepository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Periodo no encontrado');
    return updated;
  }

  async deletePeriodo(id: number): Promise<void> {
    const result = await this.periodoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Periodo no encontrado');
  }

  async getPeriodoActivo(): Promise<Periodo> {
    const activo = await this.periodoRepository.findOne({ where: { activo: true } });
    if (!activo) throw new NotFoundException('No hay un periodo activo');
    return activo;
  }

  async getPeriodoActivoConMaterias(): Promise<Periodo> {
    const activo = await this.periodoRepository.findOne({
      where: { activo: true },
      relations: ['materiaPeriodoPlanes', 'materiaPeriodoPlanes.materia', 'materiaPeriodoPlanes.planEstudio', 'materiaPeriodoPlanes.profesor'],
    });
    if (!activo) throw new NotFoundException('No hay un periodo activo');
    return activo;
  }

  async getMateriaById(nrc: string): Promise<MateriaPeriodoPlan> {
    const materia = await this.materiaPeriodoPlanRepository.findOne({
      where: { materia: { nrc: nrc } },
      relations: ['periodo', 'materia', 'planEstudio', 'profesor'],
    });
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return materia;
  }

  async getMateriasByDocente(docenteId: number): Promise<Materia[]> {
    const periodoActivo = await this.getPeriodoActivo();
    const mpps = await this.materiaPeriodoPlanRepository.find({
      where: {
        profesor: { id: docenteId },
        periodo: { id: periodoActivo.id },
      },
      relations: ['materia'],
    });
    return mpps.map((mpp) => mpp.materia);
  }

  // =============================================
  // IMPORTAR PDF - Lógica principal
  // =============================================
  async importarPDF(file: Express.Multer.File, periodoId: number) {
    // 1. Verificar que el periodo existe
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) throw new NotFoundException('Periodo no encontrado');

    if (!file) throw new BadRequestException('No se proporcionó un archivo PDF');

    // 2. Extraer texto del PDF usando pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(file.buffer);
    const allText: string = pdfData.text;

    // 4. Extraer el nombre del plan de estudio del encabezado del PDF
    // Ejemplo: "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN"
    const planMatch = allText.match(/Facultad de Ciencias de la Computación\s+(.+?)\s*-\s*CAMPUS/);
    const planNombre = planMatch ? planMatch[1].trim() : 'Plan de Estudio Desconocido';

    // 5. Buscar o crear el Plan de Estudio
    let planEstudio = await this.planEstudioRepository.findOne({ where: { nombre: planNombre } });
    if (!planEstudio) {
      planEstudio = this.planEstudioRepository.create({ nombre: planNombre });
      planEstudio = await this.planEstudioRepository.save(planEstudio);
    }

    // 6. Parsear las filas de materias del texto
    // Formato: NRC(5 dígitos)  Clave(XXXX NNN)  Materia  Secc  Dia  Hora  Profesor  Salon
    const materiaRows = this.parseMaterias(allText);

    // 7. Insertar materias y relaciones en la BD
    let materiasCreadas = 0;
    let relacionesCreadas = 0;

    for (const row of materiaRows) {
      // Buscar o crear la materia
      let materia = await this.materiaRepository.findOne({ where: { nrc: row.nrc } });
      if (!materia) {
        materia = this.materiaRepository.create({
          nrc: row.nrc,
          nombre: row.nombre,
        });
        materia = await this.materiaRepository.save(materia);
        materiasCreadas++;
      }

      // Buscar o crear el Profesor
      let profesor = await this.profesorRepository.findOne({ where: { nombre: row.profesor } });
      if (!profesor && row.profesor) {
        profesor = this.profesorRepository.create({ nombre: row.profesor });
        profesor = await this.profesorRepository.save(profesor);
      }

      // Verificar que no exista ya la relación
      const existeRelacion = await this.materiaPeriodoPlanRepository.findOne({
        where: {
          materia: { nrc: row.nrc },
          periodo: { id: periodoId },
          planEstudio: { id: planEstudio.id },
        },
      });

      if (!existeRelacion) {
        const mpp = this.materiaPeriodoPlanRepository.create({
          materia,
          periodo,
          planEstudio,
          profesor: profesor || undefined,
        });
        await this.materiaPeriodoPlanRepository.save(mpp);
        relacionesCreadas++;
      }
    }

    return {
      mensaje: 'PDF importado exitosamente',
      planEstudio: planNombre,
      periodo: periodo.nombre,
      materiasCreadas,
      relacionesCreadas,
      totalMateriasEncontradas: materiaRows.length,
    };
  }

  /**
   * Parsea el texto extraído del PDF y devuelve un arreglo de materias únicas.
   * Formato esperado por fila:
   * NRC(5 dígitos) | Clave(XXXX NNN) | Materia | Secc | Dia | Hora | Profesor | Salon
   */
  private parseMaterias(text: string): MateriaRow[] {
    const materias = new Map<string, MateriaRow>();
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Buscar líneas que empiecen con un NRC (5 dígitos)
      // Formato: "50030 CCOS 260 Redes de ComputadorasOO1   L  1000-1059 TREVINO - SANCHEZ DANIEL1CCO4/305"
      const nrcMatch = trimmed.match(/^(\d{5})\s+([A-Z]{3,4}\s+\d{3})\s+(.+?)\s+(\d{4}-\d{4})\s+(.+?\d[A-Z]{3,4}\d?\/\d{3})$/);

      if (nrcMatch) {
        const nrc = nrcMatch[1];
        const clave = nrcMatch[2];

        // La materia + sección están pegados, necesitamos separarlos
        // Ejemplo: "Redes de ComputadorasOO1   L"
        // Extraemos solo hasta antes de la sección (OO1, 101, etc.)
        let materiaRaw = nrcMatch[3];

        // Extraer profesor del grupo 5: "TREVINO - SANCHEZ DANIEL1CCO4/305"
        // El profesor termina donde empieza el salón (patrón: dígito + CCO o similar)
        const profSalonStr = nrcMatch[5];
        const profMatch = profSalonStr.match(/^(.+?)(\d[A-Z]{3,4}\d?\/\d{3})$/);
        const profesor = profMatch ? profMatch[1].trim() : profSalonStr;

        // Extraer nombre de materia limpio (quitar sección y día del raw)
        // "Redes de ComputadorasOO1   L" -> "Redes de Computadoras"
        const materiaClean = materiaRaw.replace(/[A-Z\d]{2,3}\s+[LMAVJ]\s*$/, '').trim();
        // Quitar sección pegada al final: "ComputadorasOO1" -> "Computadoras"  
        const nombre = materiaClean.replace(/([a-záéíóúñ])(O{1,2}\d|1\d{2})$/i, '$1').trim();

        if (!materias.has(nrc)) {
          materias.set(nrc, { nrc, clave, nombre, seccion: '', profesor });
        }
      }
    }

    return Array.from(materias.values());
  }
}
