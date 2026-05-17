import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';
import { CalificacionesService } from './calificaciones.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';

@Controller()
export class CalificacionesController {
    
  constructor(
    private readonly calificacionesService:
      CalificacionesService,
  ) {}
  //Ponderaciones
   @Get('ponderaciones/:materiaId')
  getPonderaciones(
    @Param('materiaId')
    materiaId: string,
  ) {

    return this.calificacionesService
      .getPonderaciones(
        Number(materiaId),
      );
  }

  @Post('ponderaciones/:materiaId')
  crearPonderaciones(
    @Param('materiaId')
    materiaId: string,

    @Body()
    data: any,
  ) {

    return this.calificacionesService
      .crearPonderacion({
        ...data,
        materiaId:
          Number(materiaId),
      });
  }

  @Put('ponderaciones/:materiaId')
  actualizarPonderaciones(
    @Param('materiaId')
    materiaId: string,

    @Body()
    data: any,
  ) {

    return this.calificacionesService
      .actualizarPonderaciones(
        Number(materiaId),
        data,
      );
  }
  //Actividades 

  @Post('actividades')
  crearActividad(
    @Body()
    data: any,
  ) {

    return this.calificacionesService
      .crearActividad(data);
  }
  //Calificaciones
   @Post('calificaciones')
  registrarCalificacion(
    @Body()
    data: CreateCalificacionDto,
  ) {

    return this.calificacionesService
      .registrarCalificacion(
        data,
      );
  }

  @Post('calificaciones/importar')
  @UseInterceptors(FileInterceptor('file'))
  importar(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.calificacionesService.importarCalificaciones(file);
  }
  @Post('test')
  @UseInterceptors(FileInterceptor('file'))
  test(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
  //Concentrado
  @Get('concentrado/:materiaId')
  getConcentrado(
    @Param('materiaId')
    materiaId: string,
  ) {

    return this.calificacionesService
      .getConcentrado(
        Number(materiaId),
      );
  }
}
