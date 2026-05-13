import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { DocentesService } from './docentes.service';
import { AuthClient } from '../grpc_clients/auth/auth.client';

@Controller('docentes')
export class DocentesController {

  constructor(
    private readonly docentesService: DocentesService,
    private readonly authClient: AuthClient,
  ) {}

  // Método para validar usuario
  private async validate(auth?: string) {
    const token = auth?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.authClient.validateToken(token);
  }

  // GET /docentes
  @Get()
  async getDocentes(
    @Headers('authorization') auth: string,
  ) {

    await this.validate(auth);

    return this.docentesService.getDocentes();
  }

  // POST /docentes/importar
 @Post('importar')
  @UseInterceptors(FileInterceptor('archivo'))
  async importarDocentes(
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') auth: string,
  ) {

    await this.validate(auth);

    return this.docentesService.importarPDF(file);
  }
}