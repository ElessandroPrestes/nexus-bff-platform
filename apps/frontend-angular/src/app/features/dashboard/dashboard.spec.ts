import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { AcordoResponseDto } from '@nexus/common';
import { of } from 'rxjs';
import { AcordosApiService } from '../../core/api/acordos-api.service';
import { DashboardComponent } from './dashboard';

function acordo(id: string, status: string, centavos: number): AcordoResponseDto {
  return {
    id,
    descricao: `Acordo ${id}`,
    valorEmCentavos: centavos,
    dataVencimento: '2026-12-31',
    status: status as AcordoResponseDto['status'],
    tipoPagamento: 'PIX' as AcordoResponseDto['tipoPagamento'],
    numeroParcelas: 1,
    devedorId: 'devedor-1',
    credorId: 'credor-1',
    criadoEm: '2026-10-31T12:00:00.000Z',
    atualizadoEm: '2026-10-31T12:00:00.000Z',
  };
}

describe('DashboardComponent', () => {
  let listar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    listar = vi.fn().mockReturnValue(
      of([
        acordo('1', 'PENDENTE', 10000),
        acordo('2', 'ATIVO', 20000),
        acordo('3', 'INADIMPLENTE', 30000),
        acordo('4', 'CONCLUIDO', 40000),
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), { provide: AcordosApiService, useValue: { listar } }],
    }).compileComponents();
  });

  it('calcula os quatro KPIs a partir dos acordos', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const texto = (fixture.nativeElement.textContent as string).replace(/\u00a0/g, ' ');
    expect(texto).toContain('R$ 600,00');
    expect(texto).toContain('R$ 300,00');
    expect(texto).toContain('R$ 400,00');
    expect(texto).toContain('R$ 250,00');
    expect(texto).toContain('Acordo 4');
  });

  it('exibe empty state quando não há acordos', () => {
    listar.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum acordo cadastrado ainda');
  });
});
