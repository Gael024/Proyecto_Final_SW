import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MateriaPeriodoPlan } from './materia-periodo-plan.entity';

@Entity('profesores')
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre?: string;

  @OneToMany(() => MateriaPeriodoPlan, mpp => mpp.profesor)
  materiaPeriodoPlanes: MateriaPeriodoPlan[];
}