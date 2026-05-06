import { Controller, Get, Post, Body } from '@nestjs/common';
import { DocentesService } from './docentes.service';

@Controller('docentes')
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  // GET /docentes
  @Get()
  getDocentes() {
    return this.docentesService.getDocentes();
  }

  // POST /docentes/importar
  @Post('importar')
  importarDocentes(@Body() data: any[]) {
    return this.docentesService.importar(data);
  }
}