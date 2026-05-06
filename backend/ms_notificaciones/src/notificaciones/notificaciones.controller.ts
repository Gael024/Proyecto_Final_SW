//import { Controller } from '@nestjs/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BajaDto } from './dto/baja.dto';
import { BienvenidaDto } from './dto/bienvenida.dto';
import { CierreMateriaDto } from './dto/cierre-materia.dto';
import { ResetPasswordEmailDto } from './dto/reset-password-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailType } from './entities/email-log.entity';
import { NotificacionesService } from './notificaciones.service';


@Controller('notificaciones')
export class NotificacionesController {
    constructor(
    private readonly notificacionesService: NotificacionesService,
  ) {}

  @Post('test')
  sendTest(@Body() body: { to: string }) {
    return this.notificacionesService.sendEmail({
      to: body.to,
      subject: 'Correo de prueba - AGM',
      body: 'Correo de prrueba desde el microservicio de notificaciones.',
      type: EmailType.TEST,
    });
  }

  @Post('bienvenida')
  sendBienvenida(@Body() dto: BienvenidaDto) {
    return this.notificacionesService.sendBienvenida(dto);
  }

  @Post('reset-password')
  sendResetPassword(@Body() dto: ResetPasswordEmailDto) {
    return this.notificacionesService.sendResetPassword(dto);
  }

  @Post('baja')
  sendBaja(@Body() dto: BajaDto) {
    return this.notificacionesService.sendBaja(dto);
  }

  @Post('cierre-materia')
  sendCierreMateria(@Body() dto: CierreMateriaDto) {
    return this.notificacionesService.sendCierreMateria(dto);
  }

  @Get('logs')
  findLogs() {
    return this.notificacionesService.findLogs();
  }
}
