import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CierreMateriaDto {
  @IsArray()
  @IsEmail({}, { each: true })
  destinatarios: string[];

  @IsString()
  @IsNotEmpty()
  nombreMateria: string;

  @IsString()
  @IsNotEmpty()
  nombreDocente: string;
}