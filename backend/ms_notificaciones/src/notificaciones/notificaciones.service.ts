import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { BienvenidaDto } from './dto/bienvenida.dto';
import { BajaDto } from './dto/baja.dto';
import { CierreMateriaDto } from './dto/cierre-materia.dto';
import { ResetPasswordEmailDto } from './dto/reset-password-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailLog, EmailStatus, EmailType } from './entities/email-log.entity';

@Injectable()
export class NotificacionesService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(EmailLog)
    private readonly emailLogRepository: Repository<EmailLog>,
  ) {
    const smtpSecure =
      this.configService.get<string>('SMTP_SECURE') === 'true';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT') || 2525,
      secure: smtpSecure,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  
  async onModuleInit() {
    //console.log('Entrando a onModuleInit de NotificacionesService');
  try {
    await this.transporter.verify();
    this.logger.log('SMTP configurado correctamente');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    this.logger.warn(`No se pudo verificar SMTP: ${errorMessage}`);
  }
}

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      await this.transporter.sendMail({
        from:
          this.configService.get<string>('SMTP_FROM') ||
          'AGM System <no-reply@agm.com>',
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        text: sendEmailDto.body,
        html: this.wrapHtml(sendEmailDto.body),
      });

      await this.saveLog({
        ...sendEmailDto,
        status: EmailStatus.SENT,
        errorMessage: null,
      });

      return {
        success: true,
        data: {
          sent: true,
        },
        message: 'Correo enviado correctamente',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      await this.saveLog({
        ...sendEmailDto,
        status: EmailStatus.FAILED,
        errorMessage,
      });

      return {
        success: false,
        data: {
          sent: false,
          error: errorMessage,
        },
        message: 'No se pudo enviar el correo',
      };
    }
  }

  sendBienvenida(dto: BienvenidaDto) {
    return this.sendEmail({
      to: dto.to,
      subject: 'Bienvenido al sistema',
      type: EmailType.BIENVENIDA,
      body: `
Hola ${dto.nombreAlumno},

Tu cuenta en el Sistema de Gestión y Automatización de Calificaciones ha sido creada correctamente.

Tu clave de acceso es: ${dto.claveAcceso}

Es recomendable que cambies u contraseña después de iniciar sesión.
      `.trim(),
    });
  }

  sendResetPassword(dto: ResetPasswordEmailDto) {
    return this.sendEmail({
      to: dto.to,
      subject: 'Recuperación de contraseña - AGM',
      type: EmailType.RESET_PASSWORD,
      body: `
Hola ${dto.nombreUsuario},

Recibimos una solicitud para restablecer tu contraseña.

Usa el siguiente enlace:
${dto.resetLink}

Si no fuiste tu quien realizó la solicitud, ignora este mensaje.
      `.trim(),
    });
  }

  sendBaja(dto: BajaDto) {
    return this.sendEmail({
      to: dto.to,
      subject: 'Notificación de baja de materia',
      type: EmailType.BAJA,
      body: `
Hola ${dto.nombreDocente},

El alumno ${dto.nombreAlumno} se ha dado de baja de la materia ${dto.nombreMateria}.

Este mensaje fue generado automáticamente por AGM.
      `.trim(),
    });
  }

  async sendCierreMateria(dto: CierreMateriaDto) {
    const results: Array<{
      to: string;
      result: {
        success: boolean;
        data: {
          sent: boolean;
          error?: string;
        };
        message: string;
      };
    }> = [];

    for (const destinatario of dto.destinatarios) {
      const result = await this.sendEmail({
        to: destinatario,
        subject: `Cierre de materia: ${dto.nombreMateria}`,
        type: EmailType.CIERRE_MATERIA,
        body: `
Hola,

La materia ${dto.nombreMateria} impartida por el profesor ${dto.nombreDocente} se ha cerrado.

Ya puedes consultar tu calificación en el sistema.
        `.trim(),
      });

      results.push({
        to: destinatario,
        result,
      });
    }

    return {
      success: true,
      data: results,
      message: 'Proceso de notificación de cierre completado',
    };
  }

  async findLogs() {
    const logs = await this.emailLogRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      success: true,
      data: logs,
      message: 'Historial de correos obtenido correctamente',
    };
  }

  private async saveLog(data: {
    to: string;
    subject: string;
    body: string;
    type: EmailType;
    status: EmailStatus;
    errorMessage: string | null;
  }) {
    const log = this.emailLogRepository.create(data);
    return this.emailLogRepository.save(log);
  }

  private wrapHtml(body: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>AGM - Academic Grade Management</h2>
        <p>${body.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }

  
}