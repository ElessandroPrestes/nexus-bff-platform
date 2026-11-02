import {
  AcordoResponseDto,
  CobrancaEventoDto,
  CreateAcordoDto,
  StatusAcordo,
  TipoPagamento,
} from '@nexus/common';
import { RmqContext } from '@nestjs/microservices';
import { CobrancaController } from './cobranca.controller';
import { CobrancaService } from './cobranca.service';

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

function buildResponse(): AcordoResponseDto {
  const response = new AcordoResponseDto();
  response.id = 'acc-1';
  return response;
}

describe('CobrancaController', () => {
  let service: { processar: jest.Mock };
  let controller: CobrancaController;
  let channel: { ack: jest.Mock; nack: jest.Mock };
  let message: unknown;
  let context: RmqContext;

  beforeEach(() => {
    service = { processar: jest.fn() };
    controller = new CobrancaController(service as unknown as CobrancaService);
    channel = { ack: jest.fn(), nack: jest.fn() };
    message = { content: Buffer.from('{}') };
    context = {
      getChannelRef: () => channel,
      getMessage: () => message,
    } as unknown as RmqContext;
  });

  it('deve confirmar (ack) a mensagem após processar com sucesso', async () => {
    service.processar.mockResolvedValue(buildResponse());

    await controller.processar(buildEvento(), context);

    expect(service.processar).toHaveBeenCalledWith(expect.any(CobrancaEventoDto));
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('deve rejeitar sem requeue (dead-letter) quando o processamento falha', async () => {
    service.processar.mockRejectedValue(new Error('falha definitiva'));

    await controller.processar(buildEvento(), context);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});
