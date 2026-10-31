import { Module } from '@nestjs/common';
import { AcordosController } from './acordos.controller';
import { AcordosService } from './acordos.service';
import { IAcordosRepository } from './interfaces/acordos-repository.interface';
import { InMemoryAcordosRepository } from './repositories/in-memory-acordos.repository';

/**
 * AcordosModule — módulo de domínio Acordos.
 *
 * Vincula IAcordosRepository → InMemoryAcordosRepository (stub — Fase 4 troca para Mongo).
 * O Service é injetado com a abstração, garantindo DIP.
 */
@Module({
  controllers: [AcordosController],
  providers: [
    AcordosService,
    {
      provide: IAcordosRepository,
      useClass: InMemoryAcordosRepository,
    },
  ],
})
export class AcordosModule {}
