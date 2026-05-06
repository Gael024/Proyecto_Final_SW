import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { AuthClient } from '../auth/auth.client';
import { AlumnosService } from './alumnos.service';

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
  async importar(
    @Param('materiaId') materiaId: string,
    @Body() data: any[],
    @Headers('authorization') auth: string,
  ) {
    await this.validate(auth);
    return this.alumnosService.importar(materiaId, data);
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