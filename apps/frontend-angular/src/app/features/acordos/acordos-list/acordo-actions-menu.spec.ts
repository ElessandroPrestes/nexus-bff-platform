import { TestBed } from '@angular/core/testing';
import type { AcordoResponseDto } from '@nexus/common';
import { AcordoActionsMenu } from './acordo-actions-menu';

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

describe('AcordoActionsMenu', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AcordoActionsMenu] }).compileComponents();
  });

  it('emite detalhe e remover pelas ações do menu', () => {
    const fixture = TestBed.createComponent(AcordoActionsMenu);
    fixture.componentRef.setInput('acordo', ACORDO);

    const detalhes: AcordoResponseDto[] = [];
    const remocoes: AcordoResponseDto[] = [];
    fixture.componentInstance.detalhe.subscribe((acordo) => detalhes.push(acordo));
    fixture.componentInstance.remover.subscribe((acordo) => remocoes.push(acordo));

    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('summary') as HTMLElement;
    expect(menu.getAttribute('aria-label')).toBe('Ações para Acordo de teste');

    const botoes = () =>
      Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

    (botoes().find((botao) => botao.textContent?.includes('Ver detalhes')) as HTMLButtonElement).click();
    expect(detalhes).toEqual([ACORDO]);

    menu.click();
    (botoes().find((botao) => botao.textContent?.trim() === 'Remover') as HTMLButtonElement).click();
    expect(remocoes).toEqual([ACORDO]);
  });

  it('fecha o menu com Escape', () => {
    const fixture = TestBed.createComponent(AcordoActionsMenu);
    fixture.componentRef.setInput('acordo', ACORDO);
    fixture.detectChanges();

    const detalhes = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    const menu = fixture.nativeElement.querySelector('summary') as HTMLElement;
    menu.click();
    expect(detalhes.open).toBe(true);

    detalhes.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(detalhes.open).toBe(false);
  });
});
