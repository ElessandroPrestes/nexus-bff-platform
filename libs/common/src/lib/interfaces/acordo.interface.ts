import { StatusAcordo } from '../enums/status-acordo.enum';
import { TipoPagamento } from '../enums/tipo-pagamento.enum';

/**
 * IAcordo — contrato canônico de um Acordo na plataforma Nexus.
 * Agnóstico de transporte e persistência.
 */
export interface IAcordo {
  /** Identificador único (MongoDB ObjectId ou UUID) */
  id: string;

  /** Descrição textual do acordo */
  descricao: string;

  /** Valor total do acordo em centavos (inteiro) para evitar ponto flutuante */
  valorEmCentavos: number;

  /** Data de vencimento do acordo (ISO 8601) */
  dataVencimento: string;

  /** Estado atual do acordo */
  status: StatusAcordo;

  /** Forma de pagamento negociada */
  tipoPagamento: TipoPagamento;

  /** Número de parcelas (1 = à vista) */
  numeroParcelas: number;

  /** Identificador do devedor/cliente */
  devedorId: string;

  /** Identificador do credor/empresa */
  credorId: string;

  /** Carimbo de criação */
  criadoEm: string;

  /** Carimbo da última atualização */
  atualizadoEm: string;
}
