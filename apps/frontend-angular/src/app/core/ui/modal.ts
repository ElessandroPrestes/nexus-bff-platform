import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

let contador = 0;

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          aria-hidden="true"
          (click)="fechar.emit()"
        ></div>
        <div
          #dialogo
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="tituloId"
          [attr.aria-describedby]="descricaoId"
          tabindex="-1"
          class="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl outline-none"
          (keydown)="onKeydown($event)"
        >
          <h2 [id]="tituloId" class="text-lg font-semibold text-text">{{ titulo() }}</h2>
          <div [id]="descricaoId" class="mt-2 text-sm text-muted">
            <ng-content />
          </div>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <ng-content select="[modalActions]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  private readonly documento = inject(DOCUMENT);
  private readonly dialogo = viewChild<ElementRef<HTMLElement>>('dialogo');
  private readonly id = `modal-${++contador}`;
  private ultimoFoco: HTMLElement | null = null;

  readonly aberto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly fechar = output<void>();

  protected readonly tituloId = `${this.id}-titulo`;
  protected readonly descricaoId = `${this.id}-descricao`;

  constructor() {
    effect(() => {
      if (this.aberto()) {
        this.ultimoFoco = this.documento.activeElement as HTMLElement | null;
        queueMicrotask(() => this.dialogo()?.nativeElement.focus());
      } else if (this.ultimoFoco) {
        this.ultimoFoco.focus();
        this.ultimoFoco = null;
      }
    });
  }

  protected onKeydown(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.fechar.emit();
      return;
    }

    if (evento.key !== 'Tab') {
      return;
    }

    const painel = this.dialogo()?.nativeElement;
    if (!painel) {
      return;
    }

    const focaveis = Array.from(
      painel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((elemento) => {
      const estilo = this.documento.defaultView?.getComputedStyle(elemento);
      return estilo?.display !== 'none' && estilo?.visibility !== 'hidden';
    });

    if (focaveis.length === 0) {
      evento.preventDefault();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && this.documento.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && this.documento.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
}
