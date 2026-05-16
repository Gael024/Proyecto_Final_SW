import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { SesionAsistencia } from '../../sesiones/entities/sesion-asistencia.entity';

export enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  RETARDO = 'RETARDO',
}

@Entity('asistencias')
export class Asistencia {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alumnoId: number;

  @Column()
  materiaId: number;

  @Column({
    type: 'enum',
    enum: EstadoAsistencia,
  })
  estado: EstadoAsistencia;

  @Column({
    type: 'timestamp',
  })
  timestampQR: Date;

  @ManyToOne(
    () => SesionAsistencia,
    (sesion) => sesion.asistencias,
  )

  @JoinColumn({
  name: 'sesionId',
  })

  sesion: SesionAsistencia;

  @Column()
  sesionId: string;

  @CreateDateColumn()
  createdAt: Date;
}

//  Esto representa el "REGISTRO INDIVIDUAL DE CADA ALUMNO"

//  Alumno 2021365
//  Materia 5
//  Estado: PRESENTE