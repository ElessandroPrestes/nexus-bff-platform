import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { AcordoResponseDto, CobrancaEventoDto } from '@nexus/common';
import { ICobrancaRepository } from './interfaces/cobranca-repository.interface';

export const COBRANCA_RETRY_OPTIONS = Symbol('COBRANCA_RETRY_OPTIONS');

export interface CobrancaRetryOptions {
  /** Número total de tentativas (inclui a primeira). */
  attempts: number;
  /** Atraso base em milissegundos; dobra a cada tentativa. */
  baseDelayMs: number;
}

export const DEFAULT_COBRANCA_RETRY_OPTIONS: CobrancaRetryOptions = {
  attempts: Number(process.env.COBRANCA_RETRY_ATTEMPTS ?? 3),
  baseDelayMs: Number(process.env.COBRANCA_RETRY_BASE_DELAY_MS ?? 200),
};

/**
 * CobrancaService — processamento do evento de cobrança (SRP).
 *
 * Depende de ICobrancaRepository (DIP). Aplica idempotência por `eventoId` e
 * retry com backoff exponencial em falhas transitórias de persistência.
 */
@Injectable()
export class CobrancaService {
  private readonly logger = new Logger(CobrancaService.name);
  private readonly retryOptions: CobrancaRetryOptions;

  constructor(
    private readonly repository: ICobrancaRepository,
    @Optional()
    @Inject(COBRANCA_RETRY_OPTIONS)
    retryOptions?: Partial<CobrancaRetryOptions>,
  ) {
    const merged = {
      ...DEFAULT_COBRANCA_RETRY_OPTIONS,
      ...retryOptions,
    };
    this.retryOptions = {
      attempts: Number.isFinite(merged.attempts) ? Math.max(1, Math.floor(merged.attempts)) : 1,
      baseDelayMs: Number.isFinite(merged.baseDelayMs) ? Math.max(0, merged.baseDelayMs) : 0,
    };
  }

  async processar(evento: CobrancaEventoDto): Promise<AcordoResponseDto> {
    const existente = await this.repository.buscarPorEvento(evento.eventoId);
    if (existente) {
      this.logger.debug(`Evento '${evento.eventoId}' já processado; ignorando`);
      return existente;
    }

    return this.comRetry(() => this.repository.salvar(evento), evento.eventoId);
  }

  private async comRetry<T>(operacao: () => Promise<T>, eventoId: string): Promise<T> {
    const { attempts, baseDelayMs } = this.retryOptions;
    let ultimoErro: unknown;

    for (let tentativa = 1; tentativa <= attempts; tentativa++) {
      try {
        return await operacao();
      } catch (error) {
        ultimoErro = error;
        const restantes = attempts - tentativa;
        this.logger.warn(
          `Falha ao processar evento '${eventoId}' (tentativa ${tentativa}/${attempts}, restantes: ${restantes})`,
        );
        if (restantes > 0) {
          await this.delay(baseDelayMs * 2 ** (tentativa - 1));
        }
      }
    }

    this.logger.error(`Evento '${eventoId}' esgotou ${attempts} tentativas de processamento`);
    throw ultimoErro;
  }

  private delay(ms: number): Promise<void> {
    if (ms <= 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
