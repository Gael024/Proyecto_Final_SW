import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Docente } from './entities/docente.entity';

@Injectable()
export class DocentesService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
  ) {}
  // GET
  async getDocentes() {
    const docentes = await this.docenteRepo.find();
    return {
      success: true,
      data: docentes,
      message: 'Docentes obtenidos correctamente',
    };
  }
  // POST (IMPORTAR)
  async importar(data: any[]) {
    const resultados: any[] = [];
    for (const item of data) {
      const existe = await this.docenteRepo.findOneBy({
        correo: item.correo,
      });
      if (existe) {
        resultados.push({ ...item, status: 'duplicado' });
        continue;
      }
      const docente = this.docenteRepo.create({
        nombre: item.nombre,
        correo: item.correo,
      });
      await this.docenteRepo.save(docente);
      resultados.push({ ...item, status: 'insertado' });
    }
    return {
      success: true,
      data: resultados,
      message: 'Proceso completado',
    };
  }
}