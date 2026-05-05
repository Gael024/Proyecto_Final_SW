import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class BajaDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  nombreDocente: string;

  @IsString()
  @IsNotEmpty()
  nombreAlumno: string;

  @IsString()
  @IsNotEmpty()
  nombreMateria: string;
}