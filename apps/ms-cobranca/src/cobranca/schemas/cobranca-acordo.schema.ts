import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * CobrancaAcordo — documento MongoDB de Acordo processado pelo worker.
 *
 * `eventoId` é único e funciona como chave de idempotência.
 */
@Schema({ collection: 'acordos', versionKey: false })
export class CobrancaAcordo {
  @Prop({ required: true, unique: true, index: true })
  eventoId!: string;

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

export type CobrancaAcordoDocument = HydratedDocument<CobrancaAcordo>;

export const CobrancaAcordoSchema = SchemaFactory.createForClass(CobrancaAcordo);
