// src/entities/materia-periodo-plan.entity.ts
import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Materia } from './materia.entity';
import { Periodo } from './periodo.entity';
import { PlanEstudio } from './plan-estudio.entity';

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

  @Column({ nullable: true })
  docenteId: string; // UUID del docente asignado
}
