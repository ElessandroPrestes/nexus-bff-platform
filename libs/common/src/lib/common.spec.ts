import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { StatusAcordo } from '../lib/enums/status-acordo.enum';
import { TipoPagamento } from '../lib/enums/tipo-pagamento.enum';
import { CreateAcordoDto } from '../lib/dtos/create-acordo.dto';
import { UpdateAcordoDto } from '../lib/dtos/update-acordo.dto';
import { AcordoResponseDto } from '../lib/dtos/acordo-response.dto';
import type { IAcordo } from '../lib/interfaces/acordo.interface';
import type { IPaginatedResult } from '../lib/interfaces/paginated-result.interface';
import type { IApiResponse } from '../lib/interfaces/api-response.interface';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildValidPayload(): object {
  return {
    descricao: 'Parcelamento de dívida comercial',
    valorEmCentavos: 150000,
    dataVencimento: '2026-12-31',
    status: StatusAcordo.PENDENTE,
    tipoPagamento: TipoPagamento.PIX,
    numeroParcelas: 12,
    devedorId: 'devedor-123',
    credorId: 'credor-456',
  };
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

describe('StatusAcordo', () => {
  it('deve conter todos os estados esperados', () => {
    expect(StatusAcordo.PENDENTE).toBe('PENDENTE');
    expect(StatusAcordo.ATIVO).toBe('ATIVO');
    expect(StatusAcordo.CONCLUIDO).toBe('CONCLUIDO');
    expect(StatusAcordo.CANCELADO).toBe('CANCELADO');
    expect(StatusAcordo.INADIMPLENTE).toBe('INADIMPLENTE');
  });

  it('deve ter exatamente 5 valores', () => {
    const values = Object.values(StatusAcordo);
    expect(values).toHaveLength(5);
  });
});

describe('TipoPagamento', () => {
  it('deve conter todas as formas de pagamento esperadas', () => {
    expect(TipoPagamento.BOLETO).toBe('BOLETO');
    expect(TipoPagamento.PIX).toBe('PIX');
    expect(TipoPagamento.CARTAO_CREDITO).toBe('CARTAO_CREDITO');
    expect(TipoPagamento.CARTAO_DEBITO).toBe('CARTAO_DEBITO');
    expect(TipoPagamento.TRANSFERENCIA).toBe('TRANSFERENCIA');
  });

  it('deve ter exatamente 5 valores', () => {
    const values = Object.values(TipoPagamento);
    expect(values).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// CreateAcordoDto — validações
// ---------------------------------------------------------------------------

describe('CreateAcordoDto', () => {
  async function validateDto(payload: object) {
    const dto = plainToInstance(CreateAcordoDto, payload);
    return validate(dto);
  }

  it('deve passar com payload válido', async () => {
    const errors = await validateDto(buildValidPayload());
    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar descricao vazia', async () => {
    const errors = await validateDto({ ...buildValidPayload(), descricao: '' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('descricao');
  });

  it('deve rejeitar descricao com menos de 5 caracteres', async () => {
    const errors = await validateDto({ ...buildValidPayload(), descricao: 'abc' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('descricao');
  });

  it('deve rejeitar descricao com mais de 500 caracteres', async () => {
    const errors = await validateDto({ ...buildValidPayload(), descricao: 'a'.repeat(501) });
    const props = errors.map((e) => e.property);
    expect(props).toContain('descricao');
  });

  it('deve rejeitar valorEmCentavos negativo', async () => {
    const errors = await validateDto({ ...buildValidPayload(), valorEmCentavos: -1 });
    const props = errors.map((e) => e.property);
    expect(props).toContain('valorEmCentavos');
  });

  it('deve rejeitar valorEmCentavos zero', async () => {
    const errors = await validateDto({ ...buildValidPayload(), valorEmCentavos: 0 });
    const props = errors.map((e) => e.property);
    expect(props).toContain('valorEmCentavos');
  });

  it('deve rejeitar valorEmCentavos decimal', async () => {
    const errors = await validateDto({ ...buildValidPayload(), valorEmCentavos: 150.5 });
    const props = errors.map((e) => e.property);
    expect(props).toContain('valorEmCentavos');
  });

  it('deve rejeitar dataVencimento inválida', async () => {
    const errors = await validateDto({ ...buildValidPayload(), dataVencimento: 'nao-e-data' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('dataVencimento');
  });

  it('deve rejeitar status inválido', async () => {
    const errors = await validateDto({ ...buildValidPayload(), status: 'INVALIDO' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('status');
  });

  it('deve rejeitar tipoPagamento inválido', async () => {
    const errors = await validateDto({ ...buildValidPayload(), tipoPagamento: 'CHEQUE' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('tipoPagamento');
  });

  it('deve rejeitar numeroParcelas menor que 1', async () => {
    const errors = await validateDto({ ...buildValidPayload(), numeroParcelas: 0 });
    const props = errors.map((e) => e.property);
    expect(props).toContain('numeroParcelas');
  });

  it('deve rejeitar numeroParcelas maior que 360', async () => {
    const errors = await validateDto({ ...buildValidPayload(), numeroParcelas: 361 });
    const props = errors.map((e) => e.property);
    expect(props).toContain('numeroParcelas');
  });

  it('deve rejeitar devedorId vazio', async () => {
    const errors = await validateDto({ ...buildValidPayload(), devedorId: '' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('devedorId');
  });

  it('deve rejeitar credorId vazio', async () => {
    const errors = await validateDto({ ...buildValidPayload(), credorId: '' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('credorId');
  });
});

// ---------------------------------------------------------------------------
// UpdateAcordoDto — todos os campos opcionais
// ---------------------------------------------------------------------------

describe('UpdateAcordoDto', () => {
  it('deve passar com payload vazio (todos opcionais)', async () => {
    const dto = plainToInstance(UpdateAcordoDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('deve validar campos quando fornecidos', async () => {
    const dto = plainToInstance(UpdateAcordoDto, { valorEmCentavos: -100 });
    const errors = await validate(dto);
    const props = errors.map((e) => e.property);
    expect(props).toContain('valorEmCentavos');
  });

  it('deve aceitar atualização parcial com apenas um campo válido', async () => {
    const dto = plainToInstance(UpdateAcordoDto, { status: StatusAcordo.CANCELADO });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// AcordoResponseDto — shape de saída
// ---------------------------------------------------------------------------

describe('AcordoResponseDto', () => {
  it('deve construir uma instância com todos os campos', () => {
    const dto = new AcordoResponseDto();
    dto.id = 'abc-123';
    dto.descricao = 'Acordo teste';
    dto.valorEmCentavos = 5000;
    dto.dataVencimento = '2026-12-31';
    dto.status = StatusAcordo.ATIVO;
    dto.tipoPagamento = TipoPagamento.BOLETO;
    dto.numeroParcelas = 1;
    dto.devedorId = 'devedor-1';
    dto.credorId = 'credor-1';
    dto.criadoEm = '2026-10-29T22:00:00.000Z';
    dto.atualizadoEm = '2026-10-29T22:00:00.000Z';

    expect(dto.id).toBe('abc-123');
    expect(dto.status).toBe(StatusAcordo.ATIVO);
    expect(dto.tipoPagamento).toBe(TipoPagamento.BOLETO);
  });
});

// ---------------------------------------------------------------------------
// Interfaces — checagem de atribuição (compilação / type-level)
// ---------------------------------------------------------------------------

describe('Interfaces (type-level)', () => {
  it('IAcordo deve aceitar objeto com todos os campos obrigatórios', () => {
    const acordo: IAcordo = {
      id: '1',
      descricao: 'Teste',
      valorEmCentavos: 1000,
      dataVencimento: '2026-12-31',
      status: StatusAcordo.PENDENTE,
      tipoPagamento: TipoPagamento.PIX,
      numeroParcelas: 3,
      devedorId: 'd-1',
      credorId: 'c-1',
      criadoEm: '2026-10-29T22:00:00.000Z',
      atualizadoEm: '2026-10-29T22:00:00.000Z',
    };
    expect(acordo.id).toBe('1');
  });

  it('IPaginatedResult<T> deve aceitar resultado paginado genérico', () => {
    const result: IPaginatedResult<string> = {
      data: ['a', 'b'],
      total: 10,
      page: 1,
      limit: 2,
      totalPages: 5,
    };
    expect(result.totalPages).toBe(5);
  });

  it('IApiResponse<T> deve aceitar envelope de sucesso', () => {
    const response: IApiResponse<{ id: string }> = {
      success: true,
      data: { id: '1' },
      message: 'OK',
      timestamp: new Date().toISOString(),
    };
    expect(response.success).toBe(true);
  });

  it('IApiResponse<T> deve aceitar envelope de erro sem data', () => {
    const response: IApiResponse = {
      success: false,
      errors: ['Campo inválido'],
      timestamp: new Date().toISOString(),
    };
    expect(response.success).toBe(false);
    expect(response.errors).toContain('Campo inválido');
  });
});
