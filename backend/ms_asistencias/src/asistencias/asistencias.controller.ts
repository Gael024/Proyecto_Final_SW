  import {
    Body,
    Controller,
    Post,
    Get,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';

  import { AsistenciasService } from './asistencias.service';

  //import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
  import { QrService } from '../qr/qr.service';
  import { ValidarQrDto } from './dto/validar-qr.dto';

  @Controller('asistencias')
  export class AsistenciasController {

    constructor(
      //CONTRUCTOR
      private readonly asistenciasService:
        AsistenciasService,

      private readonly qrService:
        QrService,
    ) {}

    //ENDPOINTS
    
    @Post('registrar')
      async registrarAsistencia(

        @Body()
        validarQrDto: ValidarQrDto,
      ) {

        const asistencia =
          await this.asistenciasService
            .registrarAsistencia(
              validarQrDto,
            );

        return {

          success: true,

          message:
            'Asistencia registrada correctamente',

          data: asistencia,
        };
      }//END


    //QR 
    @Post('generar-qr')
      generarQR(
        @Body()
        body: {
          alumnoId: number;
          materiaId: number;
          sesionId: string;
        },
      ) {

        return this.qrService.generarTokenQR(
          body.alumnoId,
          body.materiaId,
          body.sesionId,
        );
      }//END

    // ASISTENCIAS HOY
    @Get(':materiaId/hoy')
    async obtenerAsistenciasHoy(

      @Param(
        'materiaId',
        ParseIntPipe,
      )

      materiaId: number,
    ) {

      return await this
        .asistenciasService
        .obtenerAsistenciasHoy(
          materiaId,
        );
    }//END

    //AISTENCIAS HISTORIAL 
    @Get(':materiaId/historial')
    async obtenerHistorial(

      @Param(
        'materiaId',
        ParseIntPipe,
      )

      materiaId: number,
    ) {

      return await this
        .asistenciasService
        .obtenerHistorial(
          materiaId,
        );
    }//END



  } //END


//DEFINE DE ENDPOINT