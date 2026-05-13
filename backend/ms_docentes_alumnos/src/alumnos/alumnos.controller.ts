import { Controller, Get, Post, Delete, Param, Body,  UploadedFile, UseInterceptors,} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { AuthClient } from '../grpc_clients/auth/auth.client';
import { AlumnosService } from './alumnos.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('alumnos')
export class AlumnosController {

  constructor(
    private readonly alumnosService: AlumnosService,
    private readonly authClient: AuthClient,
  ) {}

  //Metodo para validar usuario
  private async validate(auth?: string) {
    const token = auth?.replace('Bearer ', '');
  if (!token) {
    throw new UnauthorizedException();
  }
  const user = await this.authClient.validateToken(token);
  }

  // GET /alumnos/materia/:materiaId
  @Get('materia/:materiaId')
  async getPorMateria(
    @Param('materiaId') materiaId: string,
    @Headers('authorization') auth: string) {
      await this.validate(auth);
      return this.alumnosService.getPorMateria(materiaId);
  }

  // POST /alumnos/importar/:materiaId
  @Post('importar/:materiaId')
    @UseInterceptors(FileInterceptor('archivo'))
    async importar(
      @Param('materiaId') materiaId: string,
      @UploadedFile() file: Express.Multer.File,
      @Headers('authorization') auth: string,
    ) {

      await this.validate(auth);

      return this.alumnosService.importarPDF(
        materiaId,
        file,
      );
    }

  // DELETE /alumnos/:id/baja/:materiaId
  @Delete(':id/baja/:materiaId')
  async baja(
    @Param('id') id: string,
    @Param('materiaId') materiaId: string,
    @Headers('authorization') auth: string,
  ) {
    await this.validate(auth);
    return this.alumnosService.baja(id, materiaId);
  }
}