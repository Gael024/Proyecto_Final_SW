import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';

import { Calificacion } from './calificacion.entity';

@Entity('actividades')
export class Actividad {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  materiaId: number;

  @Column()
  nombre: string;

  @Column()
  categoria: string;

  @Column('float')
  puntosMaximos: number;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  fechaEntrega: Date;

  @Column({
    default: true
  })
  activa: boolean;

  @OneToMany(
    () => Calificacion,
    (calificacion) => calificacion.actividad
  )
  calificaciones: Calificacion[];
}