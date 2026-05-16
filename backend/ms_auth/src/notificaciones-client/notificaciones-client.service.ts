import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface SendResetPasswordRequest {
  to: string;
  nombreUsuario: string;
  resetLink: string;
}

interface SendNotificationResponse {
  sent: boolean;
  message: string;
}

interface NotificacionesGrpcService {
  SendResetPassword(
    data: SendResetPasswordRequest,
  ): Observable<SendNotificationResponse>;
}

@Injectable()
export class NotificacionesClientService implements OnModuleInit {
  private notificacionesGrpcService: NotificacionesGrpcService;
  private readonly logger = new Logger(NotificacionesClientService.name);

  constructor(
    @Inject('NOTIFICACIONES_PACKAGE')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificacionesGrpcService =
      this.client.getService<NotificacionesGrpcService>(
        'NotificacionesService',
      );
  }

  async sendResetPassword(data: SendResetPasswordRequest) {
    try {
      const response = await firstValueFrom(
        this.notificacionesGrpcService.SendResetPassword(data),
      );

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      this.logger.warn(
        `No se pudo enviar correo de recuperación: ${errorMessage}`,
      );

      return {
        sent: false,
        message: 'No se pudo enviar el correo de recuperación',
      };
    }
  }
}