import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @IsString()
  @IsNotEmpty()
  resetLink: string;
}