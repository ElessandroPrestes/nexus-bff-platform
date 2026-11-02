import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import type { AcordoResponseDto } from '@nexus/common';

@Component({
  selector: 'app-acordo-actions-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details #menu class="relative">
      <summary
        class="inline-flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border px-3 py-1 text-xs font-semibold text-text transition-colors hover:bg-bg"
        [attr.aria-label]="'Ações para ' + acordo().descricao"
      >
        Ações
      </summary>
      <div
        class="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-border bg-surface p-1 shadow-lg"
      >
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm text-text transition-colors hover:bg-bg"
          (click)="escolher('detalhe')"
        >
          Ver detalhes
        </button>
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          (click)="escolher('remover')"
        >
          Remover
        </button>
      </div>
    </details>
  `,
  host: {
    '(keydown.escape)': 'fecharMenu($event)',
  },
})
export class AcordoActionsMenu {
  private readonly menu = viewChild<ElementRef<HTMLDetailsElement>>('menu');

  readonly acordo = input.required<AcordoResponseDto>();
  readonly detalhe = output<AcordoResponseDto>();
  readonly remover = output<AcordoResponseDto>();

  protected escolher(acao: 'detalhe' | 'remover'): void {
    this.menu()?.nativeElement.removeAttribute('open');
    if (acao === 'detalhe') {
      this.detalhe.emit(this.acordo());
    } else {
      this.remover.emit(this.acordo());
    }
  }

  protected fecharMenu(evento: Event): void {
    const menu = this.menu()?.nativeElement;
    if (menu?.open) {
      evento.preventDefault();
      menu.removeAttribute('open');
    }
  }
}
