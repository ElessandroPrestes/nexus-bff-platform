import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ROTULOS_STATUS, STATUS_ACORDO } from '../acordo-options';

@Component({
  selector: 'app-acordos-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="sticky top-16 z-20 flex flex-wrap items-end gap-3 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur sm:px-5"
    >
      <div class="min-w-56 flex-1">
        <label for="filtro-termo" class="mb-1 block text-xs font-semibold text-muted uppercase"
          >Buscar</label
        >
        <input
          id="filtro-termo"
          type="search"
          placeholder="Descrição, devedor ou credor…"
          [value]="termo()"
          (input)="onTermo($event)"
          class="w-full rounded-xl border border-border bg-bg/60 min-h-11 px-3 py-2 text-sm text-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand"
        />
      </div>

      <div>
        <label for="filtro-status" class="mb-1 block text-xs font-semibold text-muted uppercase"
          >Status</label
        >
        <select
          id="filtro-status"
          [value]="status()"
          (change)="onStatus($event)"
          class="rounded-xl border border-border bg-surface min-h-11 px-3 py-2 text-sm text-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand"
        >
          <option value="TODOS">Todos</option>
          @for (opcao of statusOpcoes; track opcao) {
            <option [value]="opcao">{{ rotulosStatus[opcao] }}</option>
          }
        </select>
      </div>

      <div>
        <label for="filtro-ordenacao" class="mb-1 block text-xs font-semibold text-muted uppercase"
          >Ordenar</label
        >
        <select
          id="filtro-ordenacao"
          [value]="ordenacao()"
          (change)="onOrdenacao($event)"
          class="rounded-xl border border-border bg-surface min-h-11 px-3 py-2 text-sm text-text outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand"
        >
          <option value="vencimento">Vencimento</option>
          <option value="valor">Maior valor</option>
          <option value="descricao">Descrição</option>
        </select>
      </div>

      @if (temFiltro()) {
        <button
          type="button"
          class="min-h-11 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-bg hover:text-text"
          (click)="limpar.emit()"
        >
          Limpar filtros
        </button>
      }
    </div>
  `,
})
export class AcordosToolbar {
  readonly termo = input.required<string>();
  readonly status = input.required<string>();
  readonly ordenacao = input.required<string>();
  readonly temFiltro = input.required<boolean>();

  readonly termoChange = output<string>();
  readonly statusChange = output<string>();
  readonly ordenacaoChange = output<string>();
  readonly limpar = output<void>();

  protected readonly statusOpcoes = STATUS_ACORDO;
  protected readonly rotulosStatus = ROTULOS_STATUS;

  protected onTermo(evento: Event): void {
    this.termoChange.emit((evento.target as HTMLInputElement).value);
  }

  protected onStatus(evento: Event): void {
    this.statusChange.emit((evento.target as HTMLSelectElement).value);
  }

  protected onOrdenacao(evento: Event): void {
    this.ordenacaoChange.emit((evento.target as HTMLSelectElement).value);
  }
}
