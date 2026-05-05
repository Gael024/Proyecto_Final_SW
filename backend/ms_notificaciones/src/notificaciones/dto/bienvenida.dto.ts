import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class BienvenidaDto {
    @IsEmail()
    to: string;

    @IsString()
    @IsNotEmpty()
    nombreAlumno: string;

    @IsString()
    @IsNotEmpty()
    claveAcceso: string;
}