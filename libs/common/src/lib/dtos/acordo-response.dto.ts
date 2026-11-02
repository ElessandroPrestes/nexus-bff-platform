import { StatusAcordo } from '../enums/status-acordo.enum';
import { TipoPagamento } from '../enums/tipo-pagamento.enum';

/**
 * AcordoResponseDto — shape de saída de um Acordo retornado pela API.
 * Contém todos os campos de negócio mais metadados do sistema.
 * Usado como payload de IApiResponse<AcordoResponseDto>.
 */
export class AcordoResponseDto {
  /** Identificador único gerado pelo sistema */
  id!: string;

  /** Descrição do acordo */
  descricao!: string;

  /** Valor total em centavos */
  valorEmCentavos!: number;

  /** Data de vencimento (ISO 8601) */
  dataVencimento!: string;

  /** Estado atual do acordo */
  status!: StatusAcordo;

  /** Forma de pagamento */
  tipoPagamento!: TipoPagamento;

  /** Número de parcelas */
  numeroParcelas!: number;

  /** Identificador do devedor */
  devedorId!: string;

  /** Identificador do credor */
  credorId!: string;

  /** Carimbo de criação (ISO 8601) */
  criadoEm!: string;

  /** Carimbo da última atualização (ISO 8601) */
  atualizadoEm!: string;
}
