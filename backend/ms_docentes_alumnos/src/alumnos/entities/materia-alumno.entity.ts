import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Alumno } from './alumno.entity';
import { Materia } from './materia.entity';

@Entity('materias_alumnos')
export class MateriaAlumno {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Alumno, alumno => alumno.materias)
  @JoinColumn({ name: 'id_alumno' })
  alumno: Alumno;

  @ManyToOne(() => Materia, materia => materia.alumnos)
  @JoinColumn({ name: 'id_materia' })
  materia: Materia;

  @Column()
  estado: string; // 'alta' | 'baja'
}