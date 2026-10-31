import { Injectable } from '@nestjs/common';
import {
  AcordoResponseDto,
  CreateAcordoDto,
  StatusAcordo,
  UpdateAcordoDto,
} from '@nexus/common';
import { IAcordosRepository } from '../interfaces/acordos-repository.interface';

/**
 * InMemoryAcordosRepository — implementação em memória de IAcordosRepository.
 *
 * Stub para desenvolvimento e testes.
 * Será substituído por MongoAcordosRepository na Fase 4 sem alteração no Service.
 *
 * Gera IDs sequenciais simples (não UUID) para manter a lib sem dependências extras.
 */
@Injectable()
export class InMemoryAcordosRepository implements IAcordosRepository {
  private readonly store = new Map<string, AcordoResponseDto>();
  private counter = 0;

  private generateId(): string {
    return `acordo-${++this.counter}-${Date.now()}`;
  }

  private now(): string {
    return new Date().toISOString();
  }

  async create(dto: CreateAcordoDto): Promise<AcordoResponseDto> {
    const now = this.now();
    const acordo: AcordoResponseDto = {
      id: this.generateId(),
      descricao: dto.descricao,
      valorEmCentavos: dto.valorEmCentavos,
      dataVencimento: dto.dataVencimento,
      status: dto.status ?? StatusAcordo.PENDENTE,
      tipoPagamento: dto.tipoPagamento,
      numeroParcelas: dto.numeroParcelas,
      devedorId: dto.devedorId,
      credorId: dto.credorId,
      criadoEm: now,
      atualizadoEm: now,
    };
    this.store.set(acordo.id, acordo);
    return acordo;
  }

  async findAll(): Promise<AcordoResponseDto[]> {
    return Array.from(this.store.values());
  }

  async findOne(id: string): Promise<AcordoResponseDto | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, dto: UpdateAcordoDto): Promise<AcordoResponseDto | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: AcordoResponseDto = {
      ...existing,
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.valorEmCentavos !== undefined && { valorEmCentavos: dto.valorEmCentavos }),
      ...(dto.dataVencimento !== undefined && { dataVencimento: dto.dataVencimento }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.tipoPagamento !== undefined && { tipoPagamento: dto.tipoPagamento }),
      ...(dto.numeroParcelas !== undefined && { numeroParcelas: dto.numeroParcelas }),
      ...(dto.devedorId !== undefined && { devedorId: dto.devedorId }),
      ...(dto.credorId !== undefined && { credorId: dto.credorId }),
      atualizadoEm: this.now(),
    };

    this.store.set(id, updated);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
