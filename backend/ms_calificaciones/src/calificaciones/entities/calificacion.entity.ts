import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('calificaciones')
export class Calificacion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  materiaId: number;

  @Column()
  docenteId: number;

  @Column()
  parcial: number;

  @Column('decimal', {
    precision: 4,
    scale: 2,
  })
  calificacion: number;

  @Column()
  periodoId: number;

  @CreateDateColumn()
  fechaRegistro: Date;
}