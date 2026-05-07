import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Alumno } from './entities/alumno.entity';
import { MateriaAlumno } from './entities/materia-alumno.entity';

@Injectable()
export class AlumnosService {

  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepo: Repository<Alumno>,

    @InjectRepository(MateriaAlumno)
    private readonly materiaAlumnoRepo: Repository<MateriaAlumno>,
  ) {}

  // GET alumnos por materia
  async getPorMateria(materiaId: string) {

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

  // IMPORTAR alumnos
  async importar(materiaId: string, data: any[]) {

    for (const item of data) {

      let alumno = await this.alumnoRepo.findOneBy({
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

      const relacion = this.materiaAlumnoRepo.create({
        alumno,
        materiaId: Number(materiaId),
        activo: true,
      });

      await this.materiaAlumnoRepo.save(relacion);
    }

    return {
      success: true,
      data: null,
      message: 'Alumnos importados correctamente',
    };
  }

  // BAJA alumno
  async baja(id: string, materiaId: string) {

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