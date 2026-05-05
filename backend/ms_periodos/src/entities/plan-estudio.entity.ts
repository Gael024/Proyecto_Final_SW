// src/entities/plan-estudio.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MateriaPeriodoPlan } from './materia-periodo-plan.entity';

@Entity('planes_de_estudio')
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => MateriaPeriodoPlan, (mpp) => mpp.planEstudio)
  materiaPeriodoPlanes: MateriaPeriodoPlan[];
}
