import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AcordoResponseDto, CobrancaEventoDto, StatusAcordo, TipoPagamento } from '@nexus/common';
import { Model } from 'mongoose';
import { ICobrancaRepository } from '../interfaces/cobranca-repository.interface';
import { CobrancaAcordo, CobrancaAcordoDocument } from '../schemas/cobranca-acordo.schema';

const DUPLICATE_KEY_CODE = 11000;

/**
 * MongoCobrancaRepository — implementação MongoDB de ICobrancaRepository.
 *
 * A idempotência é garantida pelo índice único em `eventoId`: a primeira
 * gravação vence e gravações concorrentes do mesmo evento retornam o registro
 * já existente (violação de chave duplicada tratada como sucesso).
 */
@Injectable()
export class MongoCobrancaRepository implements ICobrancaRepository {
  constructor(
    @InjectModel(CobrancaAcordo.name)
    private readonly model: Model<CobrancaAcordo>,
  ) {}

  async salvar(evento: CobrancaEventoDto): Promise<AcordoResponseDto> {
    const existente = await this.buscarPorEvento(evento.eventoId);
    if (existente) {
      return existente;
    }

    const now = new Date().toISOString();
    try {
      const documento = await this.model.create({
        eventoId: evento.eventoId,
        descricao: evento.acordo.descricao,
        valorEmCentavos: evento.acordo.valorEmCentavos,
        dataVencimento: evento.acordo.dataVencimento,
        status: evento.acordo.status ?? StatusAcordo.PENDENTE,
        tipoPagamento: evento.acordo.tipoPagamento,
        numeroParcelas: evento.acordo.numeroParcelas,
        devedorId: evento.acordo.devedorId,
        credorId: evento.acordo.credorId,
        criadoEm: now,
        atualizadoEm: now,
      });
      return this.toResponse(documento);
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        const concorrente = await this.buscarPorEvento(evento.eventoId);
        if (concorrente) {
          return concorrente;
        }
      }
      throw error;
    }
  }

  async buscarPorEvento(eventoId: string): Promise<AcordoResponseDto | null> {
    const documento = await this.model.findOne({ eventoId }).lean().exec();
    return documento ? this.toResponse(documento as CobrancaAcordo & { _id: unknown }) : null;
  }

  private toResponse(
    documento: (CobrancaAcordo & { _id: unknown }) | CobrancaAcordoDocument,
  ): AcordoResponseDto {
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

  private isDuplicateKey(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    return (error as { code?: number }).code === DUPLICATE_KEY_CODE;
  }
}
