import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('docentes')
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string | null;

  @Column({ type: 'int', nullable: true })
  extension_: number | null;
}