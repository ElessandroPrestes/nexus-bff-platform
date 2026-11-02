import { AcordoResponseDto, CreateAcordoDto, UpdateAcordoDto } from '@nexus/common';

/**
 * IAcordosRepository — contrato de persistência de Acordos (DIP).
 *
 * O Service depende desta interface, não de uma implementação concreta.
 * A Fase 4 substituirá InMemoryAcordosRepository por MongoAcordosRepository
 * sem alterar o Service.
 */
export abstract class IAcordosRepository {
  abstract create(dto: CreateAcordoDto): Promise<AcordoResponseDto>;
  abstract findAll(): Promise<AcordoResponseDto[]>;
  abstract findOne(id: string): Promise<AcordoResponseDto | null>;
  abstract update(id: string, dto: UpdateAcordoDto): Promise<AcordoResponseDto | null>;
  abstract remove(id: string): Promise<boolean>;
}
