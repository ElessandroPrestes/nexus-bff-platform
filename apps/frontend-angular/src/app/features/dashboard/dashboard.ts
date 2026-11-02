import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { AcordoResponseDto } from '@nexus/common';
import { finalize } from 'rxjs';
import { AcordosApiService } from '../../core/api/acordos-api.service';
import { KpiCard } from '../../core/ui/kpi-card';
import { Skeleton } from '../../core/ui/skeleton';
import { StatusBadge } from '../../core/ui/status-badge';

const STATUS_EM_ABERTO = new Set(['PENDENTE', 'ATIVO', 'INADIMPLENTE']);
const FORMATADOR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, KpiCard, Skeleton, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col gap-6" aria-labelledby="titulo-visao">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-wide text-muted uppercase">Visão geral</p>
          <h1 id="titulo-visao" class="text-2xl font-bold text-text">Operação de acordos</h1>
          <p class="text-sm text-muted">
            Indicadores calculados a partir dos acordos cadastrados.
          </p>
        </div>
        <a
          class="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast no-underline transition-opacity hover:opacity-90"
          routerLink="/acordos"
        >
          Ver acordos
        </a>
      </header>

      @if (carregando()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of [0, 1, 2, 3]; track item) {
            <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <app-skeleton [linhas]="2" />
            </div>
          }
        </div>
      } @else if (erro()) {
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-12 text-center"
          role="alert"
        >
          <p class="text-sm font-medium text-danger">{{ erro() }}</p>
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg"
            (click)="carregar()"
          >
            Tentar novamente
          </button>
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <app-kpi-card
            rotulo="Em aberto"
            [valor]="emAberto()"
            tom="brand"
            detalhe="Pendentes, ativos e inadimplentes"
          />
          <app-kpi-card
            rotulo="Inadimplência"
            [valor]="inadimplencia()"
            tom="danger"
            detalhe="Acordos em atraso"
          />
          <app-kpi-card
            rotulo="Concluídos"
            [valor]="concluidos()"
            tom="success"
            detalhe="Acordos quitados"
          />
          <app-kpi-card rotulo="Ticket médio" [valor]="ticketMedio()" detalhe="Média por acordo" />
        </div>

        <div class="rounded-2xl border border-border bg-surface shadow-sm">
          <header
            class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"
          >
            <h2 class="text-sm font-semibold text-text">Acordos recentes</h2>
            <a class="text-sm font-semibold text-brand no-underline hover:underline" routerLink="/acordos">
              Ver todos
            </a>
          </header>

          @if (recentes().length === 0) {
            <div class="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p class="text-sm text-muted">Nenhum acordo cadastrado ainda.</p>
              <a
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast no-underline transition-opacity hover:opacity-90"
                routerLink="/acordos/novo"
              >
                Cadastrar o primeiro acordo
              </a>
            </div>
          } @else {
            <ul class="divide-y divide-border">
              @for (acordo of recentes(); track acordo.id) {
                <li class="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-text">{{ acordo.descricao }}</p>
                    <p class="text-xs text-muted">
                      {{ acordo.dataVencimento | date: 'dd/MM/yyyy' }} ·
                      {{ acordo.numeroParcelas }}x
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <app-status-badge [status]="acordo.status" />
                    <span class="text-sm font-semibold tabular-nums text-text">
                      {{ acordo.valorEmCentavos / 100 | currency: 'BRL' }}
                    </span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      }
    </section>
  `,
})
export class DashboardComponent {
  private readonly api = inject(AcordosApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly acordos = signal<AcordoResponseDto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly totalCentavos = computed(() =>
    this.acordos().reduce((soma, acordo) => soma + acordo.valorEmCentavos, 0),
  );

  protected readonly emAberto = computed(() =>
    FORMATADOR.format(
      this.acordos()
        .filter((acordo) => STATUS_EM_ABERTO.has(acordo.status))
        .reduce((soma, acordo) => soma + acordo.valorEmCentavos, 0) / 100,
    ),
  );

  protected readonly inadimplencia = computed(() =>
    FORMATADOR.format(
      this.acordos()
        .filter((acordo) => acordo.status === 'INADIMPLENTE')
        .reduce((soma, acordo) => soma + acordo.valorEmCentavos, 0) / 100,
    ),
  );

  protected readonly concluidos = computed(() =>
    FORMATADOR.format(
      this.acordos()
        .filter((acordo) => acordo.status === 'CONCLUIDO')
        .reduce((soma, acordo) => soma + acordo.valorEmCentavos, 0) / 100,
    ),
  );

  protected readonly ticketMedio = computed(() => {
    const total = this.acordos().length;
    return FORMATADOR.format(total === 0 ? 0 : this.totalCentavos() / total / 100);
  });

  protected readonly recentes = computed(() =>
    [...this.acordos()]
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .slice(0, 5),
  );

  constructor() {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.api
      .listar()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (acordos) => this.acordos.set(acordos),
        error: () => this.erro.set('Não foi possível carregar os indicadores. Tente novamente.'),
      });
  }
}
