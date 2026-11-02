import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * AcordoDocument — documento MongoDB de Acordo gerenciado pelo BFF.
 *
 * Coleção `bff_acordos` — distinta de `acordos` (ms-cobranca) para evitar
 * acoplamento entre serviços via banco de dados.
 *
 * `_id` gerado pelo MongoDB é exposto como `id` (string) no AcordoResponseDto.
 */
@Schema({ collection: 'bff_acordos', versionKey: false })
export class AcordoDocument {
  @Prop({ required: true })
  descricao!: string;

  @Prop({ required: true })
  valorEmCentavos!: number;

  @Prop({ required: true })
  dataVencimento!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  tipoPagamento!: string;

  @Prop({ required: true })
  numeroParcelas!: number;

  @Prop({ required: true })
  devedorId!: string;

  @Prop({ required: true })
  credorId!: string;

  @Prop({ required: true })
  criadoEm!: string;

  @Prop({ required: true })
  atualizadoEm!: string;
}

export type AcordoMongoDocument = HydratedDocument<AcordoDocument>;

export const AcordoSchema = SchemaFactory.createForClass(AcordoDocument);
