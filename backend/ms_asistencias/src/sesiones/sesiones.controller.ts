import {
  Body,
  Controller,
  Post,
  Delete,
  Param,
  Get,
} from '@nestjs/common';

import { SesionesService } from './sesiones.service';

import { CrearSesionDto } from './dto/crear-sesion.dto';

@Controller('sesiones')
export class SesionesController {

  //CONTRUCTOR
  constructor(
    private readonly sesionesService: SesionesService,
  ) {}

  //METODO INICIAR 
  @Post('iniciar')
  async iniciarSesion(
    @Body() crearSesionDto: CrearSesionDto,
  ) {

    const sesion =
      await this.sesionesService.iniciarSesion(
        crearSesionDto,
      );

    return {
      success: true,

      message:
        'Sesión iniciada correctamente',

      data: sesion,
    };
  }

  //PASO 2 CREAR "enpoint DELETE"
  @Delete(':id/cerrar')
  async cerrarSesion(
    @Param('id') id: string,
  ) {

    const sesion =
      await this.sesionesService.cerrarSesion(
        id,
      );

    return {
      success: true,

      message:
        'Sesión cerrada correctamente',

      data: sesion,
    };
  }

  //  CREAR ENDPOINT "consultar sesion"
  //  Nuestro QR necesita validar si la "sesion sigue activa"
  @Get(':id')
  async obtenerSesion(
    @Param('id') id: string,
  ) {

    const sesion =
      await this.sesionesService
        .verificarSesionActiva(id);

    return {
      success: true,
      data: sesion,
    };
  }


}