import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-50">
        <div
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          aria-hidden="true"
          (click)="fechar.emit()"
        ></div>
        <aside
          #painel
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="titulo()"
          tabindex="-1"
          [class]="classesPainel()"
          (keydown)="onKeydown($event)"
        >
          <header class="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <h2 class="text-base font-semibold text-text">{{ titulo() }}</h2>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-lg text-lg text-muted transition-colors hover:bg-bg hover:text-text focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Fechar"
              (click)="fechar.emit()"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <div class="flex-1 overflow-y-auto p-4">
            <ng-content />
          </div>
        </aside>
      </div>
    }
  `,
})
export class Drawer {
  private readonly documento = inject(DOCUMENT);
  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private ultimoFoco: HTMLElement | null = null;

  readonly aberto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly lado = input<'left' | 'right'>('left');
  readonly fechar = output<void>();

  protected readonly classesPainel = computed(
    () =>
      `absolute inset-y-0 flex w-80 max-w-[85vw] flex-col border-border bg-surface shadow-2xl outline-none ${
        this.lado() === 'left' ? 'left-0 border-r' : 'right-0 border-l'
      }`,
  );

  constructor() {
    effect(() => {
      if (this.aberto()) {
        this.ultimoFoco = this.documento.activeElement as HTMLElement | null;
        queueMicrotask(() => this.painel()?.nativeElement.focus());
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

    const painel = this.painel()?.nativeElement;
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
