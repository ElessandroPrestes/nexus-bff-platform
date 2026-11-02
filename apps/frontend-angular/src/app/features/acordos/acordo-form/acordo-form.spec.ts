import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { AcordoResponseDto } from '@nexus/common';
import { of } from 'rxjs';
import { AcordosApiService } from '../../../core/api/acordos-api.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AcordoFormComponent } from './acordo-form';

const ACORDO: AcordoResponseDto = {
  id: 'acordo-1',
  descricao: 'Acordo de teste',
  valorEmCentavos: 150000,
  dataVencimento: '2026-12-31',
  status: 'PENDENTE' as AcordoResponseDto['status'],
  tipoPagamento: 'PIX' as AcordoResponseDto['tipoPagamento'],
  numeroParcelas: 1,
  devedorId: 'devedor-1',
  credorId: 'credor-1',
  criadoEm: '2026-10-31T12:00:00.000Z',
  atualizadoEm: '2026-10-31T12:00:00.000Z',
};

function preencher(
  fixture: ComponentFixture<AcordoFormComponent>,
  seletor: string,
  valor: string,
): void {
  const elemento = fixture.nativeElement.querySelector(seletor) as HTMLInputElement;
  elemento.value = valor;
  elemento.dispatchEvent(new Event('input'));
}

describe('AcordoFormComponent', () => {
  let api: { criar: ReturnType<typeof vi.fn> };
  let notifications: { sucesso: ReturnType<typeof vi.fn> };
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    api = { criar: vi.fn() };
    notifications = { sucesso: vi.fn() };
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [AcordoFormComponent],
      providers: [
        provideRouter([]),
        { provide: AcordosApiService, useValue: api },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as ReturnType<
      typeof vi.fn
    >;
  });

  it('não deve enviar formulário inválido', () => {
    const fixture = TestBed.createComponent(AcordoFormComponent);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.criar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Informe uma descrição entre 5 e 500 caracteres',
    );
  });

  it('deve enviar acordo válido e navegar para a lista', () => {
    api.criar.mockReturnValue(of(ACORDO));

    const fixture = TestBed.createComponent(AcordoFormComponent);
    fixture.detectChanges();

    preencher(fixture, '#descricao', 'Acordo de teste');
    preencher(fixture, '#valorEmCentavos', '150000');
    preencher(fixture, '#dataVencimento', '2026-12-31');
    preencher(fixture, '#devedorId', 'devedor-1');
    preencher(fixture, '#credorId', 'credor-1');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: 'Acordo de teste',
        valorEmCentavos: 150000,
        dataVencimento: '2026-12-31',
        status: 'PENDENTE',
        tipoPagamento: 'PIX',
        devedorId: 'devedor-1',
        credorId: 'credor-1',
      }),
    );
    expect(notifications.sucesso).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/acordos']);
  });

  it('aplica a máscara BRL no valor', () => {
    const fixture = TestBed.createComponent(AcordoFormComponent);
    fixture.detectChanges();

    preencher(fixture, '#valorEmCentavos', '150000');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#valorEmCentavos') as HTMLInputElement;
    expect(input.value.replace(/\u00a0/g, ' ')).toBe('R$ 1.500,00');
  });

  it('valida o campo ao perder o foco', () => {
    const fixture = TestBed.createComponent(AcordoFormComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#descricao') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Informe uma descrição entre 5 e 500 caracteres',
    );
  });
});
