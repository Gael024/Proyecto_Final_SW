import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Actividad } from './actividad.entity';

@Entity('calificaciones')
export class Calificacion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  materiaId: number;

  @Column()
  actividadId: number;

  @ManyToOne(
    () => Actividad,
    (actividad) => actividad.calificaciones
  )
  @JoinColumn({
    name: 'actividadId'
  })
  actividad: Actividad;

  @Column('float')
  calificacion: number;

  @Column({
    nullable: true
  })
  comentario: string;

  @Column({
    default: 'ENTREGADO'
  })
  estado: string;
}