import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { Asistencia } from '../../asistencias/entities/asistencia.entity';

@Entity('sesiones_asistencia')
export class SesionAsistencia {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  materiaId: number;

  @Column()
  docenteId: number;

  @Column({
    type: 'timestamp',
  })
  fechaInicio: Date;

  @Column({
    type: 'timestamp',
  })
  fechaFin: Date;

  @Column({
    default: true,
  })
  activa: boolean;

  @OneToMany(
    () => Asistencia,
    (asistencia) => asistencia.sesion,
  )
  asistencias: Asistencia[];

  @CreateDateColumn()
  createdAt: Date;
}

//  Esto representa la "LA SESION DE PASE DE LISTA"
//  EJEMPLO

//  Materia: Servicios Web
//  Inicio: 7:00
//  Fin: 7:10
//  Activa: true 