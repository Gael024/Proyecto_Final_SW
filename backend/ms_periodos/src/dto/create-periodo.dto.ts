import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreatePeriodoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;
}
