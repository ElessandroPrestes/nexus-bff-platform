import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

const CASOS: Array<{ status: string; rotulo: string; cor: string }> = [
  { status: 'PENDENTE', rotulo: 'Pendente', cor: 'bg-amber-100' },
  { status: 'ATIVO', rotulo: 'Ativo', cor: 'bg-blue-100' },
  { status: 'CONCLUIDO', rotulo: 'Concluído', cor: 'bg-green-100' },
  { status: 'CANCELADO', rotulo: 'Cancelado', cor: 'bg-slate-100' },
  { status: 'INADIMPLENTE', rotulo: 'Inadimplente', cor: 'bg-red-100' },
];

describe('StatusBadge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadge] }).compileComponents();
  });

  it.each(CASOS)('mapeia $status para $rotulo', ({ status, rotulo, cor }) => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe(rotulo);
    expect(badge.className).toContain(cor);
  });

  it('usa o rótulo bruto para status desconhecido', () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', 'DESCONHECIDO');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent?.trim()).toBe('DESCONHECIDO');
  });
});
