import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';

@Controller('alumnos')
export class AlumnosController {

  constructor(private readonly alumnosService: AlumnosService) {}

  // GET /alumnos/materia/:materiaId
  @Get('materia/:materiaId')
  getPorMateria(@Param('materiaId') materiaId: string) {
    return this.alumnosService.getPorMateria(materiaId);
  }

  // POST /alumnos/importar/:materiaId
  @Post('importar/:materiaId')
  importar(
    @Param('materiaId') materiaId: string,
    @Body() data: any[]
  ) {
    return this.alumnosService.importar(materiaId, data);
  }

  // DELETE /alumnos/:id/baja/:materiaId
  @Delete(':id/baja/:materiaId')
  baja(
    @Param('id') id: string,
    @Param('materiaId') materiaId: string
  ) {
    return this.alumnosService.baja(id, materiaId);
  }
}