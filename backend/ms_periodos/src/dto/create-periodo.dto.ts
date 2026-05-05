import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreatePeriodoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}
