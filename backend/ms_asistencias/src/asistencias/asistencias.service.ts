import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ValidarQrDto } from './dto/validar-qr.dto';
import { RedisService } from '../redis/redis.service';

import {
  Asistencia,
  EstadoAsistencia,
} from './entities/asistencia.entity';

import { SesionAsistencia } from '../sesiones/entities/sesion-asistencia.entity';

import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

@Injectable()
export class AsistenciasService {

  constructor(

    @InjectRepository(Asistencia)
    private asistenciasRepository:
      Repository<Asistencia>,

    @InjectRepository(SesionAsistencia)
    private sesionesRepository:
      Repository<SesionAsistencia>,

    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async registrarAsistencia(
    //registrarDto: RegistrarAsistenciaDto,
    validarQrDto: ValidarQrDto
  ) {

    let payload;

    try {

      //LOGS
      //console.log('TOKEN RECIBIDO');
      //console.log(validarQrDto.token);

      //console.log('SECRET VERIFY');
      //console.log(process.env.JWT_SECRET);



      // PAYLOAD CONTIENE alumnoid, materiaid y sesionid
      payload =
        this.jwtService.verify(
          validarQrDto.token,
          {
            secret:
              process.env.JWT_SECRET,
          },
        );

    } catch (error) {

      //LOGS 
      //console.log(error);
      
      throw new BadRequestException(
        'QR inválido o expirado',
      );
    }

    // PASO: VERIFICAR SI EL TOKEN YA FUE UTILIZADO
    const tokenUsado =
      await this.redisService
        .tokenYaUsado(
          validarQrDto.token,
        );

    if (tokenUsado) {

      throw new BadRequestException(
        'QR ya utilizado',
      );
    }

    

    const sesion =
      await this.sesionesRepository.findOne({
        where: {
          id: payload.sesionId,
        },
      });

    if (!sesion) {
      throw new BadRequestException(
        'Sesión no encontrada',
      );
    }

    // VALIDAR SI SIGUE ACTIVA
    const ahora = new Date();

    if (
      !sesion.activa ||
      ahora > sesion.fechaFin
    ) {

      sesion.activa = false;

      await this.sesionesRepository.save(
        sesion,
      );

      throw new BadRequestException(
        'La sesión ya expiró',
      );
    }

    // VALIDAR DUPLICADO
    const asistenciaExistente =
      await this.asistenciasRepository.findOne({
        where: {
          alumnoId: payload.alumnoId,
          sesionId: payload.sesionId,
        },
      });

    if (asistenciaExistente) {
      throw new BadRequestException(
        'La asistencia ya fue registrada',
      );
    }

    // CALCULAR MINUTOS
    const diferenciaMs =
      ahora.getTime() -
      sesion.fechaInicio.getTime();

    const minutos =
      diferenciaMs / 1000 / 60;

    let estado: EstadoAsistencia;

    //if (minutos <= 0.1)  "6 SEGUNDOS"

    if (minutos <= 5) {  //5 MINUTOS

      estado =
        EstadoAsistencia.PRESENTE;

    } else {

      estado =
        EstadoAsistencia.RETARDO;
    }

    // CREAR ASISTENCIA
    const nuevaAsistencia =
      this.asistenciasRepository.create({

        alumnoId: payload.alumnoId,

        materiaId: payload.materiaId,

        sesionId: payload.sesionId,

        estado,

        timestampQR:
          new Date(payload.timestamp),
      });

    const asistenciaGuardada =
      await this.asistenciasRepository.save(
        nuevaAsistencia,
      );


    // GUARDAR TOKEN COMO USADO EN REDIS
    await this.redisService
      .guardarTokenUsado(
        validarQrDto.token,
      );

    return asistenciaGuardada;
  } // END registrarAsistencia


  async obtenerAsistenciasHoy(
    materiaId: number,
  ) {

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);

    manana.setDate(
      manana.getDate() + 1,
    );

    const asistencias =
      await this.asistenciasRepository
        .createQueryBuilder('asistencia')

        .where(
          'asistencia.materiaId = :materiaId',
          { materiaId },
        )

        .andWhere(
          'asistencia.createdAt >= :hoy',
          { hoy },
        )

        .andWhere(
          'asistencia.createdAt < :manana',
          { manana },
        )

        .getMany();

    const presentes =
      asistencias.filter(
        (a) =>
          a.estado ===
          EstadoAsistencia.PRESENTE,
      ).length;

    const retardos =
      asistencias.filter(
        (a) =>
          a.estado ===
          EstadoAsistencia.RETARDO,
      ).length;

    return {

      materiaId,

      fecha:
        hoy.toISOString()
          .split('T')[0],

      presentes,

      retardos,

      total: asistencias.length,
    };
  } //END obtenerAsistenciasHoy 
  //THIS METHOD SERCH 1)attendants today, for subject, have a register of present, delay of stendents

  async obtenerHistorial(
    materiaId: number,
  ) {

    return await this.asistenciasRepository.find({

      where: {
        materiaId,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  } //END of obtenerHistorial

  async obtenerHistorialAlumno(

    alumnoId: number,

    materiaId: number,
  ) {

    return await this
      .asistenciasRepository.find({

        where: {
          alumnoId,
          materiaId,
        },

        order: {
          createdAt: 'DESC',
        },
      });
  } //END obtenerHistorialAlumno


}//END asistenciasServices

//LOGICA DE NEGIOS ALL THE OPERATION 