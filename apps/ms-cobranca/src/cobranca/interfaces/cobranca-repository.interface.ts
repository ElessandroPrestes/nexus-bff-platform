import { AcordoResponseDto, CobrancaEventoDto } from '@nexus/common';

/**
 * ICobrancaRepository — contrato de persistência do worker (DIP).
 *
 * O Service depende desta abstração, não do Mongoose. A implementação concreta
 * pode ser substituída (memória, outro banco) sem alterar a lógica de negócio.
 */
export abstract class ICobrancaRepository {
  /** Persiste o acordo do evento e retorna o registro canônico. */
  abstract salvar(evento: CobrancaEventoDto): Promise<AcordoResponseDto>;

  /** Busca um acordo já persistido para a chave de idempotência informada. */
  abstract buscarPorEvento(eventoId: string): Promise<AcordoResponseDto | null>;
}
