import {
  AcordoResponseDto,
  CobrancaEventoDto,
  CreateAcordoDto,
  StatusAcordo,
  TipoPagamento,
} from '@nexus/common';
import { CobrancaService } from './cobranca.service';
import { ICobrancaRepository } from './interfaces/cobranca-repository.interface';

function buildEvento(eventoId = 'evt-1'): CobrancaEventoDto {
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
  evento.eventoId = eventoId;
  evento.ocorridoEm = '2026-10-31T12:00:00.000Z';
  evento.acordo = acordo;
  return evento;
}

function buildResponse(id = 'acc-1'): AcordoResponseDto {
  const response = new AcordoResponseDto();
  response.id = id;
  response.descricao = 'Acordo de teste';
  response.valorEmCentavos = 10000;
  response.dataVencimento = '2026-12-31';
  response.status = StatusAcordo.PENDENTE;
  response.tipoPagamento = TipoPagamento.PIX;
  response.numeroParcelas = 1;
  response.devedorId = 'devedor-1';
  response.credorId = 'credor-1';
  response.criadoEm = '2026-10-31T12:00:00.000Z';
  response.atualizadoEm = '2026-10-31T12:00:00.000Z';
  return response;
}

describe('CobrancaService', () => {
  let repository: jest.Mocked<ICobrancaRepository>;
  let service: CobrancaService;

  beforeEach(() => {
    repository = {
      salvar: jest.fn(),
      buscarPorEvento: jest.fn(),
    } as unknown as jest.Mocked<ICobrancaRepository>;

    service = new CobrancaService(repository, {
      attempts: 3,
      baseDelayMs: 0,
    });
  });

  it('deve persistir um evento novo', async () => {
    const evento = buildEvento();
    const response = buildResponse();
    repository.buscarPorEvento.mockResolvedValue(null);
    repository.salvar.mockResolvedValue(response);

    const result = await service.processar(evento);

    expect(repository.buscarPorEvento).toHaveBeenCalledWith('evt-1');
    expect(repository.salvar).toHaveBeenCalledWith(evento);
    expect(result).toBe(response);
  });

  it('deve ser idempotente: evento repetido não persiste de novo', async () => {
    const evento = buildEvento();
    const response = buildResponse();
    repository.buscarPorEvento.mockResolvedValue(response);

    const result = await service.processar(evento);

    expect(result).toBe(response);
    expect(repository.salvar).not.toHaveBeenCalled();
  });

  it('deve tentar novamente em falha transitória e retornar sucesso', async () => {
    const evento = buildEvento();
    const response = buildResponse();
    repository.buscarPorEvento.mockResolvedValue(null);
    repository.salvar
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('conexão perdida'))
      .mockResolvedValueOnce(response);

    const result = await service.processar(evento);

    expect(result).toBe(response);
    expect(repository.salvar).toHaveBeenCalledTimes(3);
  });

  it('deve propagar a falha após esgotar as tentativas', async () => {
    const evento = buildEvento();
    repository.buscarPorEvento.mockResolvedValue(null);
    repository.salvar.mockRejectedValue(new Error('Mongo indisponível'));

    await expect(service.processar(evento)).rejects.toThrow('Mongo indisponível');
    expect(repository.salvar).toHaveBeenCalledTimes(3);
  });
});
