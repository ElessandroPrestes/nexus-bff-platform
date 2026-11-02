import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StatusAcordo } from '../enums/status-acordo.enum';
import { TipoPagamento } from '../enums/tipo-pagamento.enum';

/**
 * UpdateAcordoDto — payload de atualização parcial de um Acordo.
 * Todos os campos são opcionais; os presentes passam pelas mesmas
 * validações do CreateAcordoDto.
 *
 * Implementado manualmente para manter a lib agnóstica de framework
 * e compatível com Jest (sem dependência de ESM externo).
 */
export class UpdateAcordoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  valorEmCentavos?: number;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @IsOptional()
  @IsEnum(StatusAcordo)
  status?: StatusAcordo;

  @IsOptional()
  @IsEnum(TipoPagamento)
  tipoPagamento?: TipoPagamento;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(360)
  numeroParcelas?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  devedorId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  credorId?: string;
}
