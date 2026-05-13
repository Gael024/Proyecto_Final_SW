import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PeriodosClient } from '../grpc_clients/periodos/periodos.client';

import { Alumno } from './entities/alumno.entity';
import { MateriaAlumno } from './entities/materia-alumno.entity';

interface AlumnoRow {
  matricula: number;
  nombre: string;
  correo: string;
}

@Injectable()
export class AlumnosService {

  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepo: Repository<Alumno>,

    @InjectRepository(MateriaAlumno)
    private readonly materiaAlumnoRepo: Repository<MateriaAlumno>,

    private readonly periodosClient: PeriodosClient,
  ) {}

  //Validacion de materia existentes
  private async validarMateria(materiaId: string,) {
    const materia =
      await this.periodosClient.getMateriaById(
        materiaId,
      );
    if (!materia || materia.id === 0) {
      throw new NotFoundException(
        'La materia no existe',
      );
    }
    return materia;
  }
  //Validar Alumno
  private async validarAlumno(matricula: string,) {
    const alumno =
      await this.alumnoRepo.findOneBy({
        matricula: Number(matricula),
      });

    if (!alumno) {
      throw new NotFoundException(
        'La matrícula no existe',
      );
    }

    return alumno;
  }
  // GET alumnos por materia
  async getPorMateria(materiaId: string) {
    await this.validarMateria(materiaId);

    const relaciones = await this.materiaAlumnoRepo.find({
      where: {
        materiaId: Number(materiaId),
        activo: true,
      },
      relations: ['alumno'],
    });

    const alumnos = relaciones.map(r => r.alumno);

    return {
      success: true,
      data: alumnos,
      message: 'Alumnos obtenidos correctamente',
    };
  }

 // IMPORTAR DESDE PDF
  async importarPDF(
    materiaId: string,
    file: Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException(
        'No se proporcionó PDF',
      );
    }

    const alumnos = await this.parsePDF(file);

    return this.importar(materiaId, alumnos);
  }

  // PARSEAR PDF
  private async parsePDF(
    file: Express.Multer.File,
  ): Promise<AlumnoRow[]> {

    const uint8Array = new Uint8Array(
      file.buffer,
    );

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
    });

    const pdf = await loadingTask.promise;

    const alumnos: AlumnoRow[] = [];
    const correos: string[] = [];

    for (
      let pageNum = 1;
      pageNum <= pdf.numPages;
      pageNum++
    ) {

      const page = await pdf.getPage(pageNum);

      // EXTRAER TEXTO
      const textContent =
        await page.getTextContent();

      const strings = textContent.items.map(
        (item: any) => item.str,
      );
      console.log(strings);

      const text = strings.join(' ');
      console.log(text);

      const regex =
        /\d+\s+([A-ZÁÉÍÓÚÑ,\.\s]+?)\s+(\d{9})/g;

        let match;

        while ((match = regex.exec(text)) !== null) {

          alumnos.push({
            nombre: match[1].trim(),
            matricula: parseInt(match[2]),
            correo: '',
          });
        }
      // EXTRAER HYPERLINKS MAILTO
      const annotations =
        await page.getAnnotations();

      const mails = annotations
        .filter((a: any) =>
          (a.url || a.unsafeUrl)
            ?.startsWith('mailto:')
        )
        .map((a: any) =>
          (a.url || a.unsafeUrl)
            .replace('mailto:', ''),
        );

      // ELIMINAR DUPLICADOS CONSECUTIVOS
      const mailsUnicos = mails.filter(
        (mail, index, arr) =>
          mail !== arr[index - 1],
      );

      correos.push(...mailsUnicos);
    }

    // ASIGNAR CORREOS
    for (let i = 0; i < alumnos.length; i++) {

      alumnos[i].correo =
        correos[i] || '';
    }

    console.log(alumnos);

    return alumnos;
  }
  async importar(materiaId: string, data: AlumnoRow[],) {
    await this.validarMateria(materiaId);
    for (const item of data) {

      let alumno =
        await this.alumnoRepo.findOneBy({
          matricula: item.matricula,
        });

      if (!alumno) {

        alumno = this.alumnoRepo.create({
          matricula: item.matricula,
          nombre: item.nombre,
          correo: item.correo,
        });

        await this.alumnoRepo.save(alumno);
      }

      // VERIFICAR SI YA EXISTE RELACIÓN
      const existeRelacion =
        await this.materiaAlumnoRepo.findOne({
          where: {
            alumno: {
              matricula: item.matricula,
            },
            materiaId: Number(materiaId),
          },
        });

      if (!existeRelacion) {

        const relacion =
          this.materiaAlumnoRepo.create({
            alumno,
            materiaId: Number(materiaId),
            activo: true,
          });

        await this.materiaAlumnoRepo.save(relacion);
      }
    }

    return {
      success: true,
      data: null,
      message: 'Alumnos importados correctamente',
    };
  }

  // BAJA alumno
  async baja(id: string, materiaId: string) {
    await this.validarMateria(materiaId);
    await this.validarAlumno(id);

    const relacion = await this.materiaAlumnoRepo.findOne({
      where: {
        alumno: {
          matricula: Number(id),
        },
        materiaId: Number(materiaId),
      },
    });

    if (!relacion) {
      throw new NotFoundException('Relación no encontrada');
    }

    relacion.activo = false;

    await this.materiaAlumnoRepo.save(relacion);

    return {
      success: true,
      data: null,
      message: 'Alumno dado de baja',
    };
  }
}