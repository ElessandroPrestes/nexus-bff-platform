import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { AcordoResponseDto } from '@nexus/common';
import { of, throwError } from 'rxjs';
import { AcordosApiService } from '../../../core/api/acordos-api.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AcordosListComponent } from './acordos-list';

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

describe('AcordosListComponent', () => {
  let api: {
    listar: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
  };
  let notifications: { sucesso: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = {
      listar: vi.fn(),
      remover: vi.fn(),
    };
    notifications = { sucesso: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AcordosListComponent],
      providers: [
        provideRouter([]),
        { provide: AcordosApiService, useValue: api },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();
  });

  it('deve renderizar os acordos retornados pela API', () => {
    api.listar.mockReturnValue(of([ACORDO]));

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Acordo de teste');
    expect(texto).toContain('Pendente');
  });

  it('deve exibir estado vazio quando não houver acordos', () => {
    api.listar.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum acordo cadastrado ainda');
  });

  it('deve exibir erro e permitir tentar novamente', () => {
    api.listar.mockReturnValue(throwError(() => new Error('falhou')));

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os acordos');

    api.listar.mockReturnValue(of([ACORDO]));
    const botoes = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    const botao = Array.from(botoes).find((item) => item.textContent?.includes('Tentar novamente'));
    botao?.click();
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acordo de teste');
  });

  it('deve remover acordo após confirmação', () => {
    api.listar.mockReturnValue(of([ACORDO]));
    api.remover.mockReturnValue(of(void 0));
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector(
      'summary[aria-label^="Ações para"]',
    ) as HTMLElement;
    menu.click();
    fixture.detectChanges();

    const gatilho = (
      Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[]
    ).find((item) => item.textContent?.trim() === 'Remover') as HTMLButtonElement;
    gatilho.click();
    fixture.detectChanges();

    const confirmar = fixture.nativeElement.querySelector(
      'button[aria-label^="Remover acordo"]',
    ) as HTMLButtonElement;
    confirmar.click();
    fixture.detectChanges();

    expect(api.remover).toHaveBeenCalledWith('acordo-1');
    expect(notifications.sucesso).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nenhum acordo cadastrado ainda');
  });

  it('filtra por descrição, devedor ou credor', () => {
    api.listar.mockReturnValue(
      of([
        ACORDO,
        { ...ACORDO, id: 'acordo-2', descricao: 'Outro acordo', devedorId: 'devedor-xyz' },
      ]),
    );

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#filtro-termo') as HTMLInputElement;
    input.value = 'devedor-xyz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Outro acordo');
    expect(texto).not.toContain('Acordo de teste');
  });

  it('ordena por maior valor', () => {
    api.listar.mockReturnValue(
      of([
        { ...ACORDO, id: 'acordo-baixo', descricao: 'Baixo', valorEmCentavos: 1000 },
        { ...ACORDO, id: 'acordo-alto', descricao: 'Alto', valorEmCentavos: 900000 },
      ]),
    );

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#filtro-ordenacao') as HTMLSelectElement;
    select.value = 'valor';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto.indexOf('Alto')).toBeLessThan(texto.indexOf('Baixo'));
  });

  it('pagina dez itens por vez', () => {
    const itens = Array.from({ length: 11 }, (_, indice) => ({
      ...ACORDO,
      id: `acordo-${indice}`,
      descricao: `Acordo ${String(indice).padStart(2, '0')}`,
    }));
    api.listar.mockReturnValue(of(itens));

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('página 1 de 2');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(10);

    const proxima = (
      Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]
    ).find((botao) => botao.textContent?.trim() === 'Próxima') as HTMLButtonElement;
    proxima.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('página 2 de 2');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('filtra por status', () => {
    api.listar.mockReturnValue(
      of([
        { ...ACORDO, id: 'acordo-pendente', descricao: 'Somente pendente', status: 'PENDENTE' },
        { ...ACORDO, id: 'acordo-concluido', descricao: 'Somente concluido', status: 'CONCLUIDO' },
      ]),
    );

    const fixture = TestBed.createComponent(AcordosListComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#filtro-status') as HTMLSelectElement;
    select.value = 'CONCLUIDO';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const texto = fixture.nativeElement.querySelector('tbody')?.textContent as string;
    expect(texto).toContain('Somente concluido');
    expect(texto).not.toContain('Somente pendente');
  });
});
