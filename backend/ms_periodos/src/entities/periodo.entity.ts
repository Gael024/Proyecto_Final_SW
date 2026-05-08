// src/entities/periodo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MateriaPeriodoPlan } from './materia-periodo-plan.entity';

@Entity('periodos')
export class Periodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ default: false })
  activo: boolean;

  @OneToMany(() => MateriaPeriodoPlan, (mpp) => mpp.periodo)
  materiaPeriodoPlanes: MateriaPeriodoPlan[];
}

