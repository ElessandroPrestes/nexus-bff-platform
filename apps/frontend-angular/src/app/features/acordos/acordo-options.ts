/**
 * Opções locais derivadas do contrato de `@nexus/common`.
 * Mantidas como literais para não incluir o runtime da lib no bundle.
 */
export const STATUS_ACORDO = [
  'PENDENTE',
  'ATIVO',
  'CONCLUIDO',
  'CANCELADO',
  'INADIMPLENTE',
] as const;

export const TIPO_PAGAMENTO = [
  'BOLETO',
  'PIX',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'TRANSFERENCIA',
] as const;

export const ROTULOS_STATUS: Record<(typeof STATUS_ACORDO)[number], string> = {
  PENDENTE: 'Pendente',
  ATIVO: 'Ativo',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  INADIMPLENTE: 'Inadimplente',
};

export const ROTULOS_TIPO_PAGAMENTO: Record<(typeof TIPO_PAGAMENTO)[number], string> = {
  BOLETO: 'Boleto',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  TRANSFERENCIA: 'Transferência',
};
