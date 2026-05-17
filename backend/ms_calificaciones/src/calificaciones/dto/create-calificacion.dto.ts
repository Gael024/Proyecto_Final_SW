import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCalificacionDto {

  @IsInt()
  alumnoId: number;

  @IsInt()
  materiaId: number;

  @IsInt()
  actividadId: number;

  @IsNumber()
  @Min(0)
  calificacion: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}