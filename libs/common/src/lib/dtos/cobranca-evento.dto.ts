import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateAcordoDto } from './create-acordo.dto';

/**
 * CobrancaEventoDto — payload de evento assíncrono de cobrança.
 *
 * Contrato compartilhado entre o BFF (produtor futuro) e o worker (consumidor).
 * `eventoId` é a chave de idempotência: o worker não processa o mesmo evento duas vezes.
 */
export class CobrancaEventoDto {
  /**
   * Identificador único e estável do evento (chave de idempotência).
   * @example "evt-2026-10-31-0001"
   */
  @IsString()
  @IsNotEmpty()
  eventoId!: string;

  /**
   * Momento em que o evento foi gerado (ISO 8601).
   * @example "2026-10-31T12:00:00.000Z"
   */
  @IsDateString()
  ocorridoEm!: string;

  /**
   * Dados do acordo a ser processado/persistido.
   */
  @ValidateNested()
  @Type(() => CreateAcordoDto)
  acordo!: CreateAcordoDto;
}
