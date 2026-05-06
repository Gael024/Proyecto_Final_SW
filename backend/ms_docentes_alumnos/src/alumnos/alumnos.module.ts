import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';

import { Alumno } from './entities/alumno.entity';
import { Materia } from './entities/materia.entity';
import { MateriaAlumno } from './entities/materia-alumno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alumno, Materia, MateriaAlumno])
  ],
  controllers: [AlumnosController],
  providers: [AlumnosService],
  exports: [AlumnosService],
})
export class AlumnosModule {}
