import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from './entities/docente.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

interface DocenteRow {
  nombre: string;
  correo: string;
  ubicacion: string | null;
  extension_: number | null;
}

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


async importarPDF(file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No se proporcionó archivo PDF');
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');

  const pdfData = await pdfParse(file.buffer);

  const text: string = pdfData.text;
  console.log(text);
  const docentes = this.parseDocentes(text);

  return this.importar(docentes);
}

  private parseDocentes(text: string): DocenteRow[] {
    const docentes: DocenteRow[] = [];

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    for (let i = 0; i < lines.length - 1; i++) {
      const nombre = lines[i];
      const siguiente = lines[i + 1];

      // detectar correo
      const correoMatch = siguiente.match(
        /([a-zA-Z0-9._%+-]+@correo\.buap\.mx)/,
      );

      if (correoMatch) {

      const correo = correoMatch[1].toLowerCase();

      // quitar correo del texto restante
      const resto = siguiente.replace(correo, '').trim();

      // detectar ubicación tipo CCO2-301
      const ubicacionMatch = resto.match(/(CCO\d-\d{3}[A-Z]?)/);

      const ubicacion = ubicacionMatch
        ? ubicacionMatch[1]
        : null;

      // detectar extensión al final
      const extensionMatch = resto.match(/(\d{4})$/);

      const extension_ = extensionMatch
        ? parseInt(extensionMatch[1])
        : null;

      docentes.push({
        nombre,
        correo,
        ubicacion,
        extension_,
      });

      i++;
    }
    }

    return docentes;
  }
  // POST (IMPORTAR)
  async importar(data: any[]) {
    const resultados: any[] = [];
    for (const item of data) {
      const existe = await this.docenteRepo.findOneBy({
        correo: item.correo,
      });
      if (existe) {
        resultados.push({ ...item, status: 'ya registrado' });
        continue;
      }
      const docente = this.docenteRepo.create({
        nombre: item.nombre,
        correo: item.correo,
        ubicacion: item.ubicacion,
        extension_: item.extension_,
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