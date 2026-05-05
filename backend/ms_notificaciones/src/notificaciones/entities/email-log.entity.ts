import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EmailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum EmailType {
  BIENVENIDA = 'BIENVENIDA',
  BAJA = 'BAJA',
  CIERRE_MATERIA = 'CIERRE_MATERIA',
  RESET_PASSWORD = 'RESET_PASSWORD',
  TEST = 'TEST',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: EmailType,
  })
  type: EmailType;

  @Column({
    type: 'enum',
    enum: EmailStatus,
  })
  status: EmailStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;
}