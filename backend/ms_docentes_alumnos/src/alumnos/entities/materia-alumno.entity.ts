import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Alumno } from './alumno.entity';

@Entity('materias_alumnos')
export class MateriaAlumno {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Alumno, alumno => alumno.materias)
  @JoinColumn({ name: 'id_alumno' })
  alumno: Alumno;

  @Column({ name: 'id_materia' })
  materiaId: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}