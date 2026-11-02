import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { COBRANCA_ACORDO_PATTERN, CobrancaEventoDto } from '@nexus/common';
import { CobrancaService } from './cobranca.service';

interface RmqChannel {
  ack(message: unknown): void;
  nack(message: unknown, allUpTo?: boolean, requeue?: boolean): void;
}

/**
 * CobrancaController — consumidor do evento de processamento de acordo.
 *
 * Ack manual: a mensagem só é confirmada após a persistência bem-sucedida.
 * Em falha definitiva (após retry do Service), a mensagem é rejeitada sem
 * requeue, encaminhando-a para a dead-letter configurada na fila.
 */
@Controller()
export class CobrancaController {
  private readonly logger = new Logger(CobrancaController.name);

  constructor(private readonly cobrancaService: CobrancaService) {}

  @EventPattern(COBRANCA_ACORDO_PATTERN)
  async processar(@Payload() evento: CobrancaEventoDto, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef() as RmqChannel;
    const message = context.getMessage();

    try {
      const acordo = await this.cobrancaService.processar(evento);
      channel.ack(message);
      this.logger.log(`Evento '${evento?.eventoId}' processado (acordo '${acordo.id}')`);
    } catch (error) {
      const motivo = error instanceof Error ? error.message : String(error);
      this.logger.error(`Evento '${evento?.eventoId}' rejeitado sem requeue: ${motivo}`);
      channel.nack(message, false, false);
    }
  }
}
