import { CreateAcordoDto, StatusAcordo, TipoPagamento, UpdateAcordoDto } from '@nexus/common';
import { Model } from 'mongoose';
import { AcordoDocument } from '../schemas/acordo.schema';
import { MongoAcordosRepository } from './mongo-acordos.repository';

/** Monta um DTO de criação com dados válidos. */
function buildCreateDto(overrides?: Partial<CreateAcordoDto>): CreateAcordoDto {
  const dto = new CreateAcordoDto();
  dto.descricao = 'Acordo de parcelamento para testes';
  dto.valorEmCentavos = 50_000;
  dto.dataVencimento = '2027-06-30';
  dto.status = StatusAcordo.PENDENTE;
  dto.tipoPagamento = TipoPagamento.PIX;
  dto.numeroParcelas = 6;
  dto.devedorId = 'devedor-001';
  dto.credorId = 'credor-001';
  return Object.assign(dto, overrides);
}

/** Monta um documento Mongo fake com _id padrão. */
function buildDoc(overrides?: Partial<AcordoDocument> & { _id?: unknown }) {
  return {
    _id: 'mongo-id-1',
    descricao: 'Acordo de parcelamento para testes',
    valorEmCentavos: 50_000,
    dataVencimento: '2027-06-30',
    status: StatusAcordo.PENDENTE,
    tipoPagamento: TipoPagamento.PIX,
    numeroParcelas: 6,
    devedorId: 'devedor-001',
    credorId: 'credor-001',
    criadoEm: '2026-11-01T12:00:00.000Z',
    atualizadoEm: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

/** Encadeia .lean().exec() retornando o valor fornecido. */
function chain(value: unknown) {
  return { lean: () => ({ exec: () => Promise.resolve(value) }) };
}

describe('MongoAcordosRepository', () => {
  let model: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };
  let repository: MongoAcordosRepository;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    repository = new MongoAcordosRepository(model as unknown as Model<AcordoDocument>);
  });

  // ──────────────────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────────────────

  describe('create', () => {
    it('deve persistir o documento e retornar AcordoResponseDto com id', async () => {
      const dto = buildCreateDto();
      model.create.mockResolvedValue(buildDoc());

      const result = await repository.create(dto);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: dto.descricao,
          valorEmCentavos: dto.valorEmCentavos,
          status: StatusAcordo.PENDENTE,
          tipoPagamento: TipoPagamento.PIX,
        }),
      );
      expect(result.id).toBe('mongo-id-1');
      expect(result.descricao).toBe(dto.descricao);
    });

    it('deve usar StatusAcordo.PENDENTE quando status não for fornecido', async () => {
      const dto = buildCreateDto({ status: undefined });
      model.create.mockResolvedValue(buildDoc());

      await repository.create(dto);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusAcordo.PENDENTE }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // findAll
  // ──────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('deve retornar lista mapeada de AcordoResponseDto', async () => {
      model.find.mockReturnValue(chain([buildDoc(), buildDoc({ _id: 'mongo-id-2' })]));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('mongo-id-1');
      expect(result[1].id).toBe('mongo-id-2');
    });

    it('deve retornar lista vazia quando não houver documentos', async () => {
      model.find.mockReturnValue(chain([]));

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────
  // findOne
  // ──────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('deve retornar o documento correto pelo id', async () => {
      model.findById.mockReturnValue(chain(buildDoc()));

      const result = await repository.findOne('mongo-id-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('mongo-id-1');
    });

    it('deve retornar null para id inexistente', async () => {
      model.findById.mockReturnValue(chain(null));

      const result = await repository.findOne('id-que-nao-existe');

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────────────────

  describe('update', () => {
    it('deve atualizar e retornar o documento atualizado', async () => {
      const dto = new UpdateAcordoDto();
      dto.status = StatusAcordo.ATIVO;

      model.findByIdAndUpdate.mockReturnValue(
        chain(buildDoc({ status: StatusAcordo.ATIVO })),
      );

      const result = await repository.update('mongo-id-1', dto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'mongo-id-1',
        expect.objectContaining({ $set: expect.objectContaining({ status: StatusAcordo.ATIVO }) }),
        { new: true },
      );
      expect(result!.status).toBe(StatusAcordo.ATIVO);
    });

    it('deve retornar null para id inexistente', async () => {
      const dto = new UpdateAcordoDto();
      dto.status = StatusAcordo.CANCELADO;
      model.findByIdAndUpdate.mockReturnValue(chain(null));

      const result = await repository.update('id-inexistente', dto);

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deve retornar true ao remover um documento existente', async () => {
      model.findByIdAndDelete.mockReturnValue(chain(buildDoc()));

      const result = await repository.remove('mongo-id-1');

      expect(result).toBe(true);
    });

    it('deve retornar false para id inexistente', async () => {
      model.findByIdAndDelete.mockReturnValue(chain(null));

      const result = await repository.remove('id-inexistente');

      expect(result).toBe(false);
    });
  });
});
