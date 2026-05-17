import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('ponderaciones')
export class Ponderacion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  materiaId: number;

  @Column()
  categoria: string;

  @Column('float')
  porcentaje: number;
}