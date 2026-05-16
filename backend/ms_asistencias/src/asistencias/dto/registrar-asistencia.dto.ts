import {
  IsNumber,
  IsString,
} from 'class-validator';

export class RegistrarAsistenciaDto {

  @IsNumber()
  alumnoId: number;

  @IsNumber()
  materiaId: number;

  @IsString()
  sesionId: string;
}