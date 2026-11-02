import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AcordoResponseDto,
  CreateAcordoDto,
  StatusAcordo,
  TipoPagamento,
  UpdateAcordoDto,
} from '@nexus/common';
import { Model } from 'mongoose';
import { IAcordosRepository } from '../interfaces/acordos-repository.interface';
import { AcordoDocument, AcordoMongoDocument } from '../schemas/acordo.schema';

/**
 * MongoAcordosRepository — implementação MongoDB de IAcordosRepository.
 *
 * Substitui InMemoryAcordosRepository em produção.
 * O InMemoryAcordosRepository é mantido para uso nos testes E2E.
 *
 * Usa `.lean()` para retornar POJOs e evitar overhead de hidratação completa
 * nos métodos de leitura — mesma estratégia do MongoCobrancaRepository.
 */
@Injectable()
export class MongoAcordosRepository implements IAcordosRepository {
  constructor(
    @InjectModel(AcordoDocument.name)
    private readonly model: Model<AcordoDocument>,
  ) {}

  async create(dto: CreateAcordoDto): Promise<AcordoResponseDto> {
    const now = new Date().toISOString();
    const documento = await this.model.create({
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
    });
    return this.toResponse(documento);
  }

  async findAll(): Promise<AcordoResponseDto[]> {
    const documentos = await this.model.find().lean().exec();
    return documentos.map((d) => this.toResponse(d as AcordoDocument & { _id: unknown }));
  }

  async findOne(id: string): Promise<AcordoResponseDto | null> {
    const documento = await this.model.findById(id).lean().exec();
    if (!documento) return null;
    return this.toResponse(documento as AcordoDocument & { _id: unknown });
  }

  async update(id: string, dto: UpdateAcordoDto): Promise<AcordoResponseDto | null> {
    const campos: Partial<AcordoDocument> = { atualizadoEm: new Date().toISOString() };

    if (dto.descricao !== undefined) campos.descricao = dto.descricao;
    if (dto.valorEmCentavos !== undefined) campos.valorEmCentavos = dto.valorEmCentavos;
    if (dto.dataVencimento !== undefined) campos.dataVencimento = dto.dataVencimento;
    if (dto.status !== undefined) campos.status = dto.status;
    if (dto.tipoPagamento !== undefined) campos.tipoPagamento = dto.tipoPagamento;
    if (dto.numeroParcelas !== undefined) campos.numeroParcelas = dto.numeroParcelas;
    if (dto.devedorId !== undefined) campos.devedorId = dto.devedorId;
    if (dto.credorId !== undefined) campos.credorId = dto.credorId;

    const documento = await this.model
      .findByIdAndUpdate(id, { $set: campos }, { new: true })
      .lean()
      .exec();

    if (!documento) return null;
    return this.toResponse(documento as AcordoDocument & { _id: unknown });
  }

  async remove(id: string): Promise<boolean> {
    const resultado = await this.model.findByIdAndDelete(id).lean().exec();
    return resultado !== null;
  }

  private toResponse(documento: AcordoDocument & { _id: unknown }): AcordoResponseDto {
    return {
      id: String(documento._id),
      descricao: documento.descricao,
      valorEmCentavos: documento.valorEmCentavos,
      dataVencimento: documento.dataVencimento,
      status: documento.status as StatusAcordo,
      tipoPagamento: documento.tipoPagamento as TipoPagamento,
      numeroParcelas: documento.numeroParcelas,
      devedorId: documento.devedorId,
      credorId: documento.credorId,
      criadoEm: documento.criadoEm,
      atualizadoEm: documento.atualizadoEm,
    };
  }
}
