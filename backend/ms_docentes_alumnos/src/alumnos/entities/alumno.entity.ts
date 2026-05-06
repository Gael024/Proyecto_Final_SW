import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { MateriaAlumno } from './materia-alumno.entity';

@Entity('alumnos')
export class Alumno {

  @PrimaryColumn()
  matricula: number;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @OneToMany(() => MateriaAlumno, ma => ma.alumno)
  materias: MateriaAlumno[];
}