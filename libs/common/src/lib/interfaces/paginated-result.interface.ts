/**
 * IPaginatedResult<T> — envelope de resposta paginada genérica.
 * Reutilizável por qualquer recurso da plataforma.
 */
export interface IPaginatedResult<T> {
  /** Itens da página atual */
  data: T[];

  /** Total de registros na coleção (sem paginação) */
  total: number;

  /** Página atual (1-based) */
  page: number;

  /** Tamanho da página solicitada */
  limit: number;

  /** Total de páginas calculado: ceil(total / limit) */
  totalPages: number;
}
