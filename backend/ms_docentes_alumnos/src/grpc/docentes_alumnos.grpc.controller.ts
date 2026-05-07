import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AlumnosService } from '../alumnos/alumnos.service';
import { DocentesService } from '../docentes/docentes.service';

@Controller()
export class DocentesAlumnosGrpcController {
  constructor(
    private readonly alumnosService: AlumnosService,
    private readonly docentesService: DocentesService,
  ) {}
  //ALUMNOS

  @GrpcMethod('Docentes_AlumnosService', 'GetAlumnosByMateria')
  async getAlumnosByMateria(data: { materiaId: number }) {
    try {
      const response = await this.alumnosService.getPorMateria(
        data.materiaId.toString(),
      );

      const alumnosFormateados = response.data.map((alumno) => ({
        id: alumno.matricula,
        nombre: alumno.nombre,
        matricula: alumno.matricula,
      }));

      return {
        alumnos: alumnosFormateados,
      };
    } catch (error) {
      return {
        alumnos: [],
      };
    }
  }

  @GrpcMethod('Docentes_AlumnosService', 'GetAlumnoById')
  async getAlumnoById(data: { alumnoId: number }) {
    try {
      const alumno = await this.alumnosService['alumnoRepo'].findOneBy({
        matricula: data.alumnoId,
      });

      if (!alumno) {
        return {
          matricula: 0,
          nombre: '',
          correo: '',
        };
      }

      return {
        matricula: alumno.matricula,
        nombre: alumno.nombre,
        correo: alumno.correo,
      };
    } catch (error) {
      return {
        matricula: 0,
        nombre: '',
        correo: '',
      };
    }
  }

  @GrpcMethod('Docentes_AlumnosService', 'IsAlumnoEnMateria')
async isAlumnoEnMateria(data: { alumnoId: number; materiaId: number }) {

  try {

    const relacion =
      await this.alumnosService['materiaAlumnoRepo'].findOne({
        where: {
          alumno: { matricula: data.alumnoId },
          materiaId: data.materiaId,
          activo: true,
        },
      });

    return {
      result: !!relacion,
    };

  } catch (error) {

    return {
      result: false,
    };
  }
}

  //DOCENTES

  @GrpcMethod('Docentes_AlumnosService', 'GetDocentes')
  async getDocentes() {
    try {
      const response = await this.docentesService.getDocentes();

      const docentesFormateados = response.data.map((docente) => ({
        id: docente.id,
        nombre: docente.nombre,
        correo: docente.correo,
      }));

      return {
        docentes: docentesFormateados,
      };
    } catch (error) {
      return {
        docentes: [],
      };
    }
  }
@GrpcMethod('Docentes_AlumnosService', 'GetDocenteById')
  async getDocenteById(data: { docenteId: number }) {
    try {
      const docente = await this.docentesService['docenteRepo'].findOneBy({
        id: data.docenteId,
      });

      if (!docente) {
        return {
          id: 0,
          nombre: '',
          correo: '',
        };
      }

      return {
        id: docente.id,
        nombre: docente.nombre,
        correo: docente.correo,
      };
    } catch (error) {
      return {
        id: 0,
        nombre: '',
        correo: '',
      };
    }
  }
}