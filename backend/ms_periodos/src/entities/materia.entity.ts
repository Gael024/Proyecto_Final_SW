// src/entities/materia.entity.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { MateriaPeriodoPlan } from './materia-periodo-plan.entity';

@Entity('materias')
export class Materia {
  @PrimaryColumn()
  nrc: string;

  @Column()
  nombre: string;

  @OneToMany(() => MateriaPeriodoPlan, (mpp) => mpp.materia)
  materiaPeriodoPlanes: MateriaPeriodoPlan[];
}

