import { IsNumber } from 'class-validator';

export class CrearSesionDto {

  @IsNumber()
  materiaId: number;

  @IsNumber()
  docenteId: number;
}

//  El DTO (Data Transfer Object)

//  Sirve
//  Validar request body
//  Tipar datos 
//  Evitar basura en request