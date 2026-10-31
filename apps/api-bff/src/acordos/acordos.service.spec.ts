import { NotFoundException } from '@nestjs/common';
import { AcordoResponseDto, CreateAcordoDto, StatusAcordo, TipoPagamento } from '@nexus/common';
import { IAcordosRepository } from './interfaces/acordos-repository.interface';
import { AcordosService } from './acordos.service';

function buildDto(overrides?: Partial<CreateAcordoDto>): CreateAcordoDto {
  const dto = new CreateAcordoDto();
  dto.descricao = overrides?.descricao ?? 'Acordo de teste';
  dto.valorEmCentavos = overrides?.valorEmCentavos ?? 10000;
  dto.dataVencimento = overrides?.dataVencimento ?? '2026-12-31';
  dto.status = overrides?.status ?? StatusAcordo.PENDENTE;
  dto.tipoPagamento = overrides?.tipoPagamento ?? TipoPagamento.PIX;
  dto.numeroParcelas = overrides?.numeroParcelas ?? 1;
  dto.devedorId = overrides?.devedorId ?? 'devedor-1';
  dto.credorId = overrides?.credorId ?? 'credor-1';
  return dto;
}

function buildResponse(id = 'acc-1'): AcordoResponseDto {
  const r = new AcordoResponseDto();
  r.id = id;
  r.descricao = 'Acordo de teste';
  r.valorEmCentavos = 10000;
  r.dataVencimento = '2026-12-31';
  r.status = StatusAcordo.PENDENTE;
  r.tipoPagamento = TipoPagamento.PIX;
  r.numeroParcelas = 1;
  r.devedorId = 'devedor-1';
  r.credorId = 'credor-1';
  r.criadoEm = new Date().toISOString();
  r.atualizadoEm = new Date().toISOString();
  return r;
}

describe('AcordosService', () => {
  let service: AcordosService;
  let repo: jest.Mocked<IAcordosRepository>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<IAcordosRepository>;

    service = new AcordosService(repo);
  });

  describe('create', () => {
    it('deve delegar ao repositório e retornar o resultado', async () => {
      const dto = buildDto();
      const response = buildResponse();
      repo.create.mockResolvedValue(response);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(response);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os acordos', async () => {
      const list = [buildResponse('acc-1'), buildResponse('acc-2')];
      repo.findAll.mockResolvedValue(list);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(repo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o acordo quando encontrado', async () => {
      const response = buildResponse('acc-42');
      repo.findOne.mockResolvedValue(response);

      const result = await service.findOne('acc-42');

      expect(result.id).toBe('acc-42');
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve retornar o acordo atualizado', async () => {
      const updated = buildResponse('acc-1');
      updated.descricao = 'Novo texto';
      repo.update.mockResolvedValue(updated);

      const result = await service.update('acc-1', { descricao: 'Novo texto' });

      expect(result.descricao).toBe('Novo texto');
    });

    it('deve lançar NotFoundException quando id não existe', async () => {
      repo.update.mockResolvedValue(null);

      await expect(service.update('nao-existe', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve completar sem erro quando acordo existe', async () => {
      repo.remove.mockResolvedValue(true);

      await expect(service.remove('acc-1')).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith('acc-1');
    });

    it('deve lançar NotFoundException quando acordo não existe', async () => {
      repo.remove.mockResolvedValue(false);

      await expect(service.remove('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
