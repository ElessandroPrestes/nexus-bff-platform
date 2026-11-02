/**
 * Constantes do contrato assíncrono de cobrança (RabbitMQ).
 */

/** Padrão (routing key) do evento de processamento de acordo. */
export const COBRANCA_ACORDO_PATTERN = 'cobranca.acordo.processar';

/** Nome padrão da fila consumida pelo worker. */
export const COBRANCA_ACORDO_QUEUE = 'cobranca.acordos';
