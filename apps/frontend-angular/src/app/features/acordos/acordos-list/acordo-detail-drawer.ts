import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AcordoResponseDto } from '@nexus/common';
import { finalize } from 'rxjs';
import { AcordosApiService } from '../../../core/api/acordos-api.service';
import { Drawer } from '../../../core/ui/drawer';
import { Skeleton } from '../../../core/ui/skeleton';
import { StatusBadge } from '../../../core/ui/status-badge';
import { ROTULOS_TIPO_PAGAMENTO } from '../acordo-options';

@Component({
  selector: 'app-acordo-detail-drawer',
  imports: [CurrencyPipe, DatePipe, Drawer, Skeleton, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer
      [aberto]="aberto()"
      [titulo]="acordo()?.descricao ?? 'Detalhes do acordo'"
      lado="right"
      (fechar)="fechar.emit()"
    >
      @if (carregando()) {
        <app-skeleton [linhas]="10" />
      } @else if (erro()) {
        <div class="flex flex-col items-start gap-4" role="alert">
          <p class="text-sm font-medium text-danger">{{ erro() }}</p>
          <button
            type="button"
            class="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg"
            (click)="recarregar()"
          >
            Tentar novamente
          </button>
        </div>
      } @else if (acordo(); as item) {
        <dl class="flex flex-col gap-4 text-sm">
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Status</dt>
            <dd class="mt-1"><app-status-badge [status]="item.status" /></dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Valor</dt>
            <dd class="mt-1 font-semibold tabular-nums text-text">
              {{ item.valorEmCentavos / 100 | currency: 'BRL' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Vencimento</dt>
            <dd class="mt-1 text-text">{{ item.dataVencimento | date: 'dd/MM/yyyy' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Parcelas</dt>
            <dd class="mt-1 text-text">{{ item.numeroParcelas }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Forma de pagamento</dt>
            <dd class="mt-1 text-text">{{ rotulosTipo[item.tipoPagamento] ?? item.tipoPagamento }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Devedor</dt>
            <dd class="mt-1 break-all text-text">{{ item.devedorId }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Credor</dt>
            <dd class="mt-1 break-all text-text">{{ item.credorId }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Criado em</dt>
            <dd class="mt-1 text-text">{{ item.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-muted uppercase">Atualizado em</dt>
            <dd class="mt-1 text-text">{{ item.atualizadoEm | date: 'dd/MM/yyyy HH:mm' }}</dd>
          </div>
        </dl>
      }
    </app-drawer>
  `,
})
export class AcordoDetailDrawer {
  private readonly api = inject(AcordosApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly aberto = input.required<boolean>();
  readonly acordoId = input<string | null>(null);
  readonly fechar = output<void>();

  protected readonly acordo = signal<AcordoResponseDto | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly rotulosTipo = ROTULOS_TIPO_PAGAMENTO;

  constructor() {
    effect(() => {
      const aberto = this.aberto();
      const id = this.acordoId();

      if (!aberto) {
        this.acordo.set(null);
        this.erro.set(null);
        return;
      }

      if (id) {
        this.carregar(id);
      }
    });
  }

  protected recarregar(): void {
    const id = this.acordoId();
    if (id) {
      this.carregar(id);
    }
  }

  private carregar(id: string): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.api
      .buscarPorId(id)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (acordo) => this.acordo.set(acordo),
        error: () => this.erro.set('Não foi possível carregar os detalhes do acordo.'),
      });
  }
}
