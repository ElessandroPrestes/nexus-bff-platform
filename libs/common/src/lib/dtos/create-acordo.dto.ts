import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StatusAcordo } from '../enums/status-acordo.enum';
import { TipoPagamento } from '../enums/tipo-pagamento.enum';

/**
 * CreateAcordoDto — payload de criação de um Acordo.
 * Validado via class-validator (agnóstico de framework).
 */
export class CreateAcordoDto {
  /**
   * Descrição do acordo.
   * @example "Parcelamento de dívida comercial"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  descricao!: string;

  /**
   * Valor total em centavos (inteiro positivo).
   * Evita erros de ponto flutuante em operações financeiras.
   * @example 150000  → R$ 1.500,00
   */
  @IsInt()
  @IsPositive()
  valorEmCentavos!: number;

  /**
   * Data de vencimento no formato ISO 8601 (YYYY-MM-DD ou full datetime).
   * @example "2026-12-31"
   */
  @IsDateString()
  dataVencimento!: string;

  /**
   * Estado inicial do acordo.
   * @example StatusAcordo.PENDENTE
   */
  @IsEnum(StatusAcordo)
  status!: StatusAcordo;

  /**
   * Forma de pagamento negociada.
   * @example TipoPagamento.PIX
   */
  @IsEnum(TipoPagamento)
  tipoPagamento!: TipoPagamento;

  /**
   * Número de parcelas (mínimo 1, máximo 360).
   * 1 representa pagamento à vista.
   */
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(360)
  numeroParcelas!: number;

  /**
   * Identificador do devedor (MongoDB ObjectId ou UUID).
   */
  @IsString()
  @IsNotEmpty()
  devedorId!: string;

  /**
   * Identificador do credor/empresa.
   */
  @IsString()
  @IsNotEmpty()
  credorId!: string;
}
