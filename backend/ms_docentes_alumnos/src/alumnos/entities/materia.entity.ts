import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { MateriaAlumno } from './materia-alumno.entity';

@Entity('materias')
export class Materia {

  @PrimaryColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => MateriaAlumno, ma => ma.materia)
  alumnos: MateriaAlumno[];
}