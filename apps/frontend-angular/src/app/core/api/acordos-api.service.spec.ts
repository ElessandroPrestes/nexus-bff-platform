import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { AcordoResponseDto, CreateAcordoDto } from '@nexus/common';
import { AcordosApiService } from './acordos-api.service';
import { API_BASE_URL } from './api.config';

const ACORDO: AcordoResponseDto = {
  id: 'acordo-1',
  descricao: 'Acordo de teste',
  valorEmCentavos: 10000,
  dataVencimento: '2026-12-31',
  status: 'PENDENTE' as AcordoResponseDto['status'],
  tipoPagamento: 'PIX' as AcordoResponseDto['tipoPagamento'],
  numeroParcelas: 1,
  devedorId: 'devedor-1',
  credorId: 'credor-1',
  criadoEm: '2026-10-31T12:00:00.000Z',
  atualizadoEm: '2026-10-31T12:00:00.000Z',
};

describe('AcordosApiService', () => {
  let service: AcordosApiService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    service = TestBed.inject(AcordosApiService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('deve listar acordos desembrulhando o envelope', () => {
    let resultado: AcordoResponseDto[] | undefined;
    service.listar().subscribe((acordos) => (resultado = acordos));

    const req = controller.expectOne('/api/v1/acordos');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [ACORDO],
      timestamp: '2026-10-31T12:00:00.000Z',
    });

    expect(resultado).toEqual([ACORDO]);
  });

  it('deve criar acordo e retornar o recurso', () => {
    const dto = {
      descricao: 'Acordo de teste',
      valorEmCentavos: 10000,
      dataVencimento: '2026-12-31',
      status: ACORDO.status,
      tipoPagamento: ACORDO.tipoPagamento,
      numeroParcelas: 1,
      devedorId: 'devedor-1',
      credorId: 'credor-1',
    } as CreateAcordoDto;

    let resultado: AcordoResponseDto | undefined;
    service.criar(dto).subscribe((acordo) => (resultado = acordo));

    const req = controller.expectOne('/api/v1/acordos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      success: true,
      data: ACORDO,
      timestamp: '2026-10-31T12:00:00.000Z',
    });

    expect(resultado).toEqual(ACORDO);
  });

  it('deve remover acordo por id codificado', () => {
    service.remover('acordo/1').subscribe();

    const req = controller.expectOne('/api/v1/acordos/acordo%2F1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
