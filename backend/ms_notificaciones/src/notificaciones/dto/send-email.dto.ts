import { IsEmail, IsEnum, IsNotEmpty, IsOptional, isString, IsString } from "class-validator";
import { EmailType } from "../entities/email-log.entity";

export class SendEmailDto {
    @IsEmail()
    to: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsEnum(EmailType)
    type: EmailType;
}