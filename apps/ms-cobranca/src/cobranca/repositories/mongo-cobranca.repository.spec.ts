import { CobrancaEventoDto, CreateAcordoDto, StatusAcordo, TipoPagamento } from '@nexus/common';
import { Model } from 'mongoose';
import { MongoCobrancaRepository } from './mongo-cobranca.repository';
import { CobrancaAcordo } from '../schemas/cobranca-acordo.schema';

function buildEvento(): CobrancaEventoDto {
  const acordo = new CreateAcordoDto();
  acordo.descricao = 'Acordo de teste';
  acordo.valorEmCentavos = 10000;
  acordo.dataVencimento = '2026-12-31';
  acordo.status = StatusAcordo.PENDENTE;
  acordo.tipoPagamento = TipoPagamento.PIX;
  acordo.numeroParcelas = 1;
  acordo.devedorId = 'devedor-1';
  acordo.credorId = 'credor-1';

  const evento = new CobrancaEventoDto();
  evento.eventoId = 'evt-1';
  evento.ocorridoEm = '2026-10-31T12:00:00.000Z';
  evento.acordo = acordo;
  return evento;
}

function buildDocumento(overrides?: Partial<CobrancaAcordo> & { _id?: unknown }) {
  return {
    _id: 'mongo-1',
    eventoId: 'evt-1',
    descricao: 'Acordo de teste',
    valorEmCentavos: 10000,
    dataVencimento: '2026-12-31',
    status: StatusAcordo.PENDENTE,
    tipoPagamento: TipoPagamento.PIX,
    numeroParcelas: 1,
    devedorId: 'devedor-1',
    credorId: 'credor-1',
    criadoEm: '2026-10-31T12:00:00.000Z',
    atualizadoEm: '2026-10-31T12:00:00.000Z',
    ...overrides,
  };
}

function chain(value: unknown) {
  return {
    lean: () => ({
      exec: () => Promise.resolve(value),
    }),
  };
}

describe('MongoCobrancaRepository', () => {
  let model: {
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let repository: MongoCobrancaRepository;

  beforeEach(() => {
    model = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    repository = new MongoCobrancaRepository(model as unknown as Model<CobrancaAcordo>);
  });

  describe('salvar', () => {
    it('deve criar o acordo quando o evento ainda não existe', async () => {
      const evento = buildEvento();
      model.findOne.mockReturnValueOnce(chain(null));
      model.create.mockResolvedValue(buildDocumento());

      const result = await repository.salvar(evento);

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventoId: 'evt-1',
          descricao: 'Acordo de teste',
          valorEmCentavos: 10000,
        }),
      );
      expect(result.id).toBe('mongo-1');
      expect(result.status).toBe(StatusAcordo.PENDENTE);
    });

    it('deve retornar o registro existente sem criar duplicata', async () => {
      const evento = buildEvento();
      model.findOne.mockReturnValueOnce(chain(buildDocumento()));

      const result = await repository.salvar(evento);

      expect(model.create).not.toHaveBeenCalled();
      expect(result.id).toBe('mongo-1');
    });

    it('deve tratar chave duplicada concorrente como sucesso idempotente', async () => {
      const evento = buildEvento();
      model.findOne
        .mockReturnValueOnce(chain(null))
        .mockReturnValueOnce(chain(buildDocumento({ _id: 'mongo-2' })));
      model.create.mockRejectedValueOnce({ code: 11000 });

      const result = await repository.salvar(evento);

      expect(result.id).toBe('mongo-2');
    });

    it('deve propagar erros que não sejam de chave duplicada', async () => {
      const evento = buildEvento();
      model.findOne.mockReturnValueOnce(chain(null));
      model.create.mockRejectedValueOnce(new Error('falha de escrita'));

      await expect(repository.salvar(evento)).rejects.toThrow('falha de escrita');
    });
  });

  describe('buscarPorEvento', () => {
    it('deve retornar null quando não houver registro', async () => {
      model.findOne.mockReturnValueOnce(chain(null));

      await expect(repository.buscarPorEvento('evt-x')).resolves.toBeNull();
    });

    it('deve mapear o documento para AcordoResponseDto', async () => {
      model.findOne.mockReturnValueOnce(chain(buildDocumento()));

      const result = await repository.buscarPorEvento('evt-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'mongo-1',
          descricao: 'Acordo de teste',
          tipoPagamento: TipoPagamento.PIX,
        }),
      );
    });
  });
});
