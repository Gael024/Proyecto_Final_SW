import { Controller, Get, Param, Post, Put, Delete, Body, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';

@Controller('/periodos')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Obtiene la materia del periodo por id
  @Get('/materias/detalle/:id')
  getMateriaByPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.appService.getMateriaByPeriodo(id);
  }

  // Obtiene las materias por docente en el periodo activo
  @Get('/materias/docente/:docenteId')
  getMateriasByDocente(@Param('docenteId') docenteId: string) {
    return this.appService.getMateriasByDocente(docenteId);
  }

  // Obtiene la información del periodo activo
  @Get('/activo')
  getPeriodoActivo() {
    return this.appService.getPeriodoActivo();
  }

  // Crear un Periodo
  @Post()
  createPeriodo(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.appService.createPeriodo(createPeriodoDto);
  }

  // Importa PDF con el catalogo de materias por periodo (Pendiente lógica interna)
  @Post('/importar')
  importarPDF() {
    return this.appService.importarPDF();
  }

  // Actualizar el periodo academico
  @Put('/:id')
  updatePeriodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.appService.updatePeriodo(id, updatePeriodoDto);
  }

  // Eliminar Periodo
  @Delete('/:id')
  deletePeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.appService.deletePeriodo(id);
  }
}
