import { IsString } from 'class-validator';

export class ValidarQrDto {

  @IsString()
  token: string;
}