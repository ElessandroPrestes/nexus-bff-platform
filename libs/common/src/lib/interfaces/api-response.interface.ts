/**
 * IApiResponse<T> — envelope de resposta HTTP padronizado para o BFF.
 * Garante consistência de contrato entre BFF e consumidores.
 */
export interface IApiResponse<T = unknown> {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;

  /** Payload da resposta (ausente em erros) */
  data?: T;

  /** Mensagem humana (sucesso ou descrição de erro) */
  message?: string;

  /** Lista de erros de validação ou de negócio */
  errors?: string[];

  /** ISO 8601 do momento em que a resposta foi gerada */
  timestamp: string;
}
