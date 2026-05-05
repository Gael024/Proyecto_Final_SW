// src/entities/materia-periodo-plan.entity.ts
import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Materia } from './materia.entity';
import { Periodo } from './periodo.entity';
import { PlanEstudio } from './plan-estudio.entity';
import { Profesor } from './profesor.entity';

@Entity('materia_periodo_plan')
export class MateriaPeriodoPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Materia, (m) => m.materiaPeriodoPlanes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nrc' })
  materia: Materia;

  @ManyToOne(() => Periodo, (p) => p.materiaPeriodoPlanes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @ManyToOne(() => PlanEstudio, (pe) => pe.materiaPeriodoPlanes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  planEstudio: PlanEstudio;

  @ManyToOne(() => Profesor, (prof) => prof.materiaPeriodoPlanes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;
}
