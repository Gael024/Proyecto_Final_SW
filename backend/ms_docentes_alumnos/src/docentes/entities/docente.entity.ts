import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('docentes')
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ nullable: true })
  extension_: number;
}