import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcordosController } from './acordos.controller';
import { AcordosService } from './acordos.service';
import { IAcordosRepository } from './interfaces/acordos-repository.interface';
import { MongoAcordosRepository } from './repositories/mongo-acordos.repository';
import { AcordoDocument, AcordoSchema } from './schemas/acordo.schema';

/**
 * AcordosModule — módulo de domínio Acordos.
 *
 * Vincula IAcordosRepository → MongoAcordosRepository (DIP).
 * O Service continua injetado com a abstração, sem conhecer o MongoDB.
 *
 * InMemoryAcordosRepository é mantido para uso exclusivo nos testes E2E,
 * que sobem o AppModule com override manual do provedor.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AcordoDocument.name, schema: AcordoSchema }]),
  ],
  controllers: [AcordosController],
  providers: [
    AcordosService,
    {
      provide: IAcordosRepository,
      useClass: MongoAcordosRepository,
    },
  ],
})
export class AcordosModule {}
