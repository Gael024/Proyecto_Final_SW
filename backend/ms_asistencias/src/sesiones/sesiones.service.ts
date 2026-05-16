import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SesionAsistencia } from './entities/sesion-asistencia.entity';

import { CrearSesionDto } from './dto/crear-sesion.dto';

@Injectable()
export class SesionesService {


//CONSTRUCTOR
  constructor(
    @InjectRepository(SesionAsistencia)
    private sesionesRepository: Repository<SesionAsistencia>,
  ) {}

//INICIAR SESION
  async iniciarSesion(
    crearSesionDto: CrearSesionDto,
  ) {

    const fechaInicio = new Date();



    const fechaFin = new Date(

     // fechaInicio.getTime() + 10 * 1000,  // 10 segundos (sin el *60)

      fechaInicio.getTime() + 10 * 60 * 1000, //Agrega 10 minutos en milisegundos
    );
    

    const nuevaSesion =
      this.sesionesRepository.create({
        ...crearSesionDto,

        fechaInicio,
        fechaFin,

        activa: true,
      });

    return await this.sesionesRepository.save(
      nuevaSesion,
    );
  }

  //  PASO 2 "VerificarSesionActiva"

  //  SE BUSCA LA SESION
  //  COMPARAMOS LA "HORA ACTUAL" CON LA "HORA FIN"
  //  SI LA SESION EXPIRO activa=false
async verificarSesionActiva(
  sesionId: string,
) {

  const sesion =
    await this.sesionesRepository.findOne({
      where: {
        id: sesionId,
      },
    });

  if (!sesion) {
    throw new Error(
      'Sesión no encontrada',
    );
  }

  const ahora = new Date();

  if (
    sesion.activa &&
    ahora > sesion.fechaFin
  ) {

    sesion.activa = false;

    await this.sesionesRepository.save(
      sesion,
    );

    return await this.sesionesRepository.findOne({
      where: {
        id: sesionId,
      },
    });
  }

  return sesion;
}

  // PASO 3 METODO "cerrarSesion"
  async cerrarSesion(
  sesionId: string,
  ) {

    const sesion =
      await this.sesionesRepository.findOne({
        where: {
          id: sesionId,
        },
      });

    if (!sesion) {
      throw new Error(
        'Sesión no encontrada',
      );
    }

    sesion.activa = false;

    return await this.sesionesRepository.save(
      sesion,
    );
  }



}
