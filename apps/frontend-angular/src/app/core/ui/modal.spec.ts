import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
  imports: [Modal],
  template: `
    <app-modal [aberto]="aberto" titulo="Teste" (fechar)="aberto = false">
      <p>Conteúdo</p>
      <div modalActions>
        <button id="cancelar">Cancelar</button>
        <button id="remover">Remover</button>
      </div>
    </app-modal>
  `,
})
class HostModal {
  aberto = true;
}

describe('Modal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Modal] }).compileComponents();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('não renderiza quando fechado', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('aberto', false);
    fixture.componentRef.setInput('titulo', 'Remover acordo');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('emite fechar ao pressionar Escape e restaura o foco', async () => {
    const gatilho = document.createElement('button');
    document.body.appendChild(gatilho);
    gatilho.focus();

    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('aberto', true);
    fixture.componentRef.setInput('titulo', 'Remover acordo');

    let fechado = 0;
    fixture.componentInstance.fechar.subscribe(() => (fechado += 1));

    fixture.detectChanges();
    await Promise.resolve();

    const dialogo = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogo).not.toBeNull();
    expect(document.activeElement).toBe(dialogo);

    dialogo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(fechado).toBe(1);

    fixture.componentRef.setInput('aberto', false);
    fixture.detectChanges();
    await Promise.resolve();

    expect(document.activeElement).toBe(gatilho);
  });

  it('prende o foco entre os controles do diálogo', async () => {
    const fixture = TestBed.createComponent(HostModal);
    fixture.detectChanges();
    await Promise.resolve();

    const dialogo = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const cancelar = fixture.nativeElement.querySelector('#cancelar') as HTMLButtonElement;
    const remover = fixture.nativeElement.querySelector('#remover') as HTMLButtonElement;

    remover.focus();
    dialogo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(cancelar);

    cancelar.focus();
    dialogo.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(remover);
  });
});
