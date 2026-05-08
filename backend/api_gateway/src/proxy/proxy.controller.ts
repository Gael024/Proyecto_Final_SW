//Cualquier petición hecha hacia el API-Gateway es reenviada al microservicio correspondiente
//POST http://localhost:3000/api/auth/login es enviada a POST http://localhost:3001/auth/login
//Sigue misma logica de reenvio en todos los microservicios
import {All, Body, Controller, Headers, Param, Query, Req} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Method } from 'axios';
import { ProxyService } from './proxy.service';

@Controller('api')
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('auth/*path')
  proxyAuth(
    @Param('path') path: string | string[],
    @Req() request: Request,
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, unknown>,
  ) {
    const msAuthUrl =
      this.configService.get<string>('MS_AUTH_URL') || 'http://localhost:3001';

    const finalPath = Array.isArray(path) ? path.join('/') : path;

    return this.proxyService.forwardRequest({
      method: request.method as Method,
      url: `${msAuthUrl}/auth/${finalPath}`,
      body,
      headers,
      query,
    });
  }

  @All('notificaciones/*path')
  proxyNotificaciones(
    @Param('path') path: string | string[],
    @Req() request: Request,
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, unknown>,
  ) {
    const msNotificacionesUrl =
      this.configService.get<string>('MS_NOTIFICACIONES_URL') ||
      'http://localhost:3006';

    const finalPath = Array.isArray(path) ? path.join('/') : path;

    return this.proxyService.forwardRequest({
      method: request.method as Method,
      url: `${msNotificacionesUrl}/notificaciones/${finalPath}`,
      body,
      headers,
      query,
    });
  }
}