import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Periodo } from './entities/periodo.entity';
import { Materia } from './entities/materia.entity';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  async createPeriodo(createPeriodoDto: CreatePeriodoDto): Promise<Periodo> {
    if (createPeriodoDto.activo) {
      await this.periodoRepository.update({}, { activo: false });
    }
    const nuevoPeriodo = this.periodoRepository.create(createPeriodoDto);
    return await this.periodoRepository.save(nuevoPeriodo);
  }

  async updatePeriodo(id: number, updatePeriodoDto: UpdatePeriodoDto): Promise<Periodo> {
    if (updatePeriodoDto.activo) {
      await this.periodoRepository.update({}, { activo: false });
    }
    await this.periodoRepository.update(id, updatePeriodoDto);
    const updated = await this.periodoRepository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Periodo no encontrado');
    return updated;
  }

  async deletePeriodo(id: number): Promise<void> {
    const result = await this.periodoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Periodo no encontrado');
  }

  async getPeriodoActivo(): Promise<Periodo> {
    const activo = await this.periodoRepository.findOne({ where: { activo: true } });
    if (!activo) throw new NotFoundException('No hay un periodo activo');
    return activo;
  }

  async getMateriaByPeriodo(materiaId: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { id: materiaId },
      relations: ['periodo'],
    });
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return materia;
  }

  async getMateriasByDocente(docenteId: string): Promise<Materia[]> {
    const periodoActivo = await this.getPeriodoActivo();
    return await this.materiaRepository.find({
      where: {
        docenteId,
        periodo: { id: periodoActivo.id },
      },
    });
  }

  importarPDF(): string {
    return `PDF importado`;
  }
}
