import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CobrancaController } from './cobranca.controller';
import {
  COBRANCA_RETRY_OPTIONS,
  CobrancaService,
  DEFAULT_COBRANCA_RETRY_OPTIONS,
} from './cobranca.service';
import { ICobrancaRepository } from './interfaces/cobranca-repository.interface';
import { MongoCobrancaRepository } from './repositories/mongo-cobranca.repository';
import { CobrancaAcordo, CobrancaAcordoSchema } from './schemas/cobranca-acordo.schema';

/**
 * CobrancaModule — módulo de domínio do worker.
 *
 * Vincula ICobrancaRepository → MongoCobrancaRepository (DIP) e injeta as
 * opções de retry configuráveis por ambiente.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: CobrancaAcordo.name, schema: CobrancaAcordoSchema }]),
  ],
  controllers: [CobrancaController],
  providers: [
    CobrancaService,
    {
      provide: ICobrancaRepository,
      useClass: MongoCobrancaRepository,
    },
    {
      provide: COBRANCA_RETRY_OPTIONS,
      useValue: DEFAULT_COBRANCA_RETRY_OPTIONS,
    },
  ],
})
export class CobrancaModule {}
