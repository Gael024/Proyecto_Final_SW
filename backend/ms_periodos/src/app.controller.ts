import {
  Controller, Get, Param, Post, Put, Delete, Body,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('/periodos')
export class AppController {
  constructor(private readonly appService: AppService) { }

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

  // Obtiene la información del periodo activo -
  @Get('/activo')
  getPeriodoActivo() {
    return this.appService.getPeriodoActivo();
  }

  // Crear un Periodo -
  @Post()
  @UseGuards(AdminGuard)
  createPeriodo(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.appService.createPeriodo(createPeriodoDto);
  }

  // Importa PDF con el catalogo de materias por periodo -
  @Post('/importar')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('archivo'))
  importarPDF(
    @UploadedFile() file: Express.Multer.File,
    @Query('periodoId', ParseIntPipe) periodoId: number,
  ) {
    return this.appService.importarPDF(file, periodoId);
  }

  // Actualizar el periodo academico -
  @Put('/:id')
  @UseGuards(AdminGuard)
  updatePeriodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.appService.updatePeriodo(id, updatePeriodoDto);
  }

  // Eliminar Periodo -
  @Delete('/:id')
  @UseGuards(AdminGuard)
  deletePeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.appService.deletePeriodo(id);
  }
}
