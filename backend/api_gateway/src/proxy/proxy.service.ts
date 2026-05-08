import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, Method } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}
 
  //
  async forwardRequest(params: {
    method: Method; //Recibe método HTTP usado
    url: string; //URL de destino (microservicio a usar)
    body?: unknown; // Cuerpo de la petición
    headers?: Record<string, string>; //Cabeceras HTTP
    query?: Record<string, unknown>; //Parametros
  }) {
    try { // Reenvio de petición a microservicio
      const response = await firstValueFrom(
        this.httpService.request({
          method: params.method,
          url: params.url,
          data: params.body,
          params: params.query,
          headers: {
            authorization: params.headers?.authorization,
            'content-type': params.headers?.['content-type'] || 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data,
          axiosError.response.status,
        );
      }

      throw new InternalServerErrorException(
        'Error al comunicarse con el microservicio',
      );
    }
  }
}