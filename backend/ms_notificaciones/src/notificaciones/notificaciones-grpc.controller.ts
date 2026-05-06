import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificacionesService } from './notificaciones.service';

interface SendBienvenidaRequest {
  to: string;
  nombreAlumno: string;
  claveAcceso: string;
}

interface SendBajaNotifRequest {
  to: string;
  nombreDocente: string;
  nombreAlumno: string;
  nombreMateria: string;
}

interface SendCierreMateriaRequest {
  destinatarios: string[];
  nombreMateria: string;
  nombreDocente: string;
}

interface SendResetPasswordRequest {
  to: string;
  nombreUsuario: string;
  resetLink: string;
}

@Controller()
export class NotificacionesGrpcController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
  ) {}

  @GrpcMethod('NotificacionesService', 'SendBienvenida')
  async sendBienvenida(request: SendBienvenidaRequest) {
    const result = await this.notificacionesService.sendBienvenida(request);

    return {
      sent: result.success,
      message: result.message,
    };
  }

  @GrpcMethod('NotificacionesService', 'SendBajaNotif')
  async sendBajaNotif(request: SendBajaNotifRequest) {
    const result = await this.notificacionesService.sendBaja(request);

    return {
      sent: result.success,
      message: result.message,
    };
  }

  @GrpcMethod('NotificacionesService', 'SendCierreMateria')
  async sendCierreMateria(request: SendCierreMateriaRequest) {
    const result =
      await this.notificacionesService.sendCierreMateria(request);

    return {
      sent: result.success,
      message: result.message,
    };
  }

  @GrpcMethod('NotificacionesService', 'SendResetPassword')
  async sendResetPassword(request: SendResetPasswordRequest) {
    const result =
      await this.notificacionesService.sendResetPassword(request);

    return {
      sent: result.success,
      message: result.message,
    };
  }
}