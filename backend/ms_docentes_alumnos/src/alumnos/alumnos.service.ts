import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { Alumno } from './entities/alumno.entity';
import { Materia } from './entities/materia.entity';
import { MateriaAlumno } from './entities/materia-alumno.entity';

@Injectable()
export class AlumnosService {
    //Constructor
    constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepo: Repository<Alumno>,

    @InjectRepository(Materia)
    private readonly materiaRepo: Repository<Materia>,

    @InjectRepository(MateriaAlumno)
    private readonly materiaAlumnoRepo: Repository<MateriaAlumno>,
    ) {}
    //Metodo GET
    async getPorMateria(materiaId: string) {
        const relaciones = await this.materiaAlumnoRepo.find({
            where: {
                materia: { id: Number(materiaId) },
                estado: 'alta',
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
    //Post Metodo
    async importar(materiaId: string, data: any[]) {
        const materia = await this.materiaRepo.findOneBy({
            id: Number(materiaId),
        });

        if (!materia) {
            throw new NotFoundException('Materia no encontrada');
        }

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
            materia,
            estado: 'alta',
        });

        await this.materiaAlumnoRepo.save(relacion);
        }

        return {
        success: true,
        data: null,
        message: 'Alumnos importados correctamente',
        };
    }
    //Metodo Delete
    async baja(id: string, materiaId: string) {
        const relacion = await this.materiaAlumnoRepo.findOne({
        where: {
            alumno: { matricula: Number(id) },
            materia: { id: Number(materiaId) },
        },
        });
        if (!relacion) {
            throw new NotFoundException('Relación no encontrada');
        }

        relacion.estado = 'baja';
        await this.materiaAlumnoRepo.save(relacion);

        return {
            success: true,
            data: null,
            message: 'Alumno dado de baja',
        };
    }

}
