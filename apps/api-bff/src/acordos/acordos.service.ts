import { Injectable, NotFoundException } from '@nestjs/common';
import { AcordoResponseDto, CreateAcordoDto, UpdateAcordoDto } from '@nexus/common';
import { IAcordosRepository } from './interfaces/acordos-repository.interface';

/**
 * AcordosService — lógica de negócio de Acordos (SRP).
 *
 * Depende da abstração IAcordosRepository (DIP), não de uma implementação concreta.
 * Não conhece HTTP — lança exceções NestJS que o Controller trata via filtros.
 */
@Injectable()
export class AcordosService {
  constructor(private readonly repository: IAcordosRepository) {}

  async create(dto: CreateAcordoDto): Promise<AcordoResponseDto> {
    return this.repository.create(dto);
  }

  async findAll(): Promise<AcordoResponseDto[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<AcordoResponseDto> {
    const acordo = await this.repository.findOne(id);
    if (!acordo) {
      throw new NotFoundException(`Acordo '${id}' não encontrado`);
    }
    return acordo;
  }

  async update(id: string, dto: UpdateAcordoDto): Promise<AcordoResponseDto> {
    const acordo = await this.repository.update(id, dto);
    if (!acordo) {
      throw new NotFoundException(`Acordo '${id}' não encontrado`);
    }
    return acordo;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);
    if (!removed) {
      throw new NotFoundException(`Acordo '${id}' não encontrado`);
    }
  }
}
