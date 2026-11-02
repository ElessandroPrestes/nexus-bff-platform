import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { AcordoResponseDto } from '@nexus/common';
import { finalize } from 'rxjs';
import { AcordosApiService } from '../../../core/api/acordos-api.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Modal } from '../../../core/ui/modal';
import { Skeleton } from '../../../core/ui/skeleton';
import { StatusBadge } from '../../../core/ui/status-badge';
import { STATUS_ACORDO } from '../acordo-options';
import { AcordoActionsMenu } from './acordo-actions-menu';
import { AcordoDetailDrawer } from './acordo-detail-drawer';
import { AcordosToolbar } from './acordos-toolbar';

type StatusOption = (typeof STATUS_ACORDO)[number];
type Ordenacao = 'vencimento' | 'valor' | 'descricao';

const POR_PAGINA = 10;

@Component({
  selector: 'app-acordos-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    AcordoActionsMenu,
    AcordoDetailDrawer,
    AcordosToolbar,
    Modal,
    Skeleton,
    StatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col gap-6" aria-labelledby="titulo-acordos">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="titulo-acordos" class="text-2xl font-bold text-text">Acordos</h1>
          <p class="text-sm text-muted">
            Consulte e cadastre acordos processados pela plataforma.
          </p>
        </div>
        <a
          class="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast no-underline transition-opacity hover:opacity-90"
          routerLink="/acordos/novo"
        >
          Novo acordo
        </a>
      </header>

      <div
        class="rounded-2xl border border-border bg-surface shadow-sm"
        [attr.aria-busy]="carregando()"
        aria-live="polite"
      >
        <app-acordos-toolbar
          [termo]="termo()"
          [status]="statusFiltro()"
          [ordenacao]="ordenacao()"
          [temFiltro]="temFiltro()"
          (termoChange)="onTermo($event)"
          (statusChange)="onStatus($event)"
          (ordenacaoChange)="onOrdenacao($event)"
          (limpar)="limparFiltros()"
        />

        @if (carregando()) {
          <div class="flex flex-col gap-4 px-4 py-6 sm:px-5" role="status">
            <span class="visually-hidden">Carregando acordos…</span>
            @for (linha of [0, 1, 2, 3, 4]; track linha) {
              <app-skeleton [linhas]="1" />
            }
          </div>
        } @else if (erro()) {
          <div class="flex flex-col items-center gap-4 px-6 py-16 text-center" role="alert">
            <svg
              class="h-10 w-10 text-danger"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path stroke-linecap="round" d="M12 8v5m0 3h.01" />
            </svg>
            <p class="text-sm font-medium text-danger">{{ erro() }}</p>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg"
              (click)="carregar()"
            >
              Tentar novamente
            </button>
          </div>
        } @else if (acordos().length === 0) {
          <div class="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <svg
              class="h-10 w-10 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 13h6m-6 4h4M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
              />
              <path stroke-linecap="round" d="M14 4v4h4" />
            </svg>
            <p class="text-sm text-muted">Nenhum acordo cadastrado ainda.</p>
            <a
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text no-underline transition-colors hover:bg-bg"
              routerLink="/acordos/novo"
            >
              Cadastrar o primeiro acordo
            </a>
          </div>
        } @else if (filtrados().length === 0) {
          <div class="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <p class="text-sm text-muted">Nenhum acordo encontrado com os filtros atuais.</p>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg"
              (click)="limparFiltros()"
            >
              Limpar filtros
            </button>
          </div>
        } @else {
          <div class="tabela-wrapper overflow-x-auto">
            <table class="tabela w-full border-collapse text-sm">
              <caption class="visually-hidden">
                Lista de acordos cadastrados
              </caption>
              <thead>
                <tr
                  class="border-b border-border text-left text-xs font-semibold tracking-wide text-muted uppercase"
                >
                  <th class="px-4 py-3 font-semibold" scope="col">Descrição</th>
                  <th class="px-4 py-3 text-right font-semibold" scope="col">Valor</th>
                  <th class="px-4 py-3 font-semibold" scope="col">Vencimento</th>
                  <th class="px-4 py-3 font-semibold" scope="col">Status</th>
                  <th class="px-4 py-3 font-semibold" scope="col">Parcelas</th>
                  <th class="px-4 py-3 font-semibold" scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (acordo of visiveis(); track acordo.id) {
                  <tr
                    class="border-b border-border transition-colors last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td class="px-4 py-3 font-medium text-text" data-rotulo="Descrição">
                      {{ acordo.descricao }}
                    </td>
                    <td
                      class="px-4 py-3 text-right tabular-nums text-text"
                      data-rotulo="Valor"
                    >
                      {{ valorEmReais(acordo.valorEmCentavos) | currency: 'BRL' }}
                    </td>
                    <td [class]="classeVencimento(acordo)" data-rotulo="Vencimento">
                      {{ acordo.dataVencimento | date: 'dd/MM/yyyy' }}
                    </td>
                    <td class="px-4 py-3" data-rotulo="Status">
                      <app-status-badge [status]="acordo.status" />
                    </td>
                    <td class="px-4 py-3 text-text" data-rotulo="Parcelas">
                      {{ acordo.numeroParcelas }}
                    </td>
                    <td class="px-4 py-3" data-rotulo="Ações">
                      <app-acordo-actions-menu
                        [acordo]="acordo"
                        (detalhe)="abrirDetalhe($event)"
                        (remover)="solicitarRemocao($event)"
                      />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <footer
            class="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted sm:px-5"
          >
            <p>
              {{ visiveis().length }} de {{ filtrados().length }} acordos ·
              página {{ paginaAtual() }} de {{ totalPaginas() }}
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                class="min-h-11 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                [disabled]="paginaAtual() <= 1"
                (click)="anterior()"
              >
                Anterior
              </button>
              <button
                type="button"
                class="min-h-11 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                [disabled]="paginaAtual() >= totalPaginas()"
                (click)="proxima()"
              >
                Próxima
              </button>
            </div>
          </footer>
        }
      </div>
    </section>

    <app-acordo-detail-drawer
      [aberto]="!!detalheId()"
      [acordoId]="detalheId()"
      (fechar)="fecharDetalhe()"
    />

    <app-modal
      [aberto]="!!acordoParaRemover()"
      titulo="Remover acordo"
      (fechar)="cancelarRemocao()"
    >
      <p>
        Remover o acordo
        <strong class="font-semibold text-text">{{ acordoParaRemover()?.descricao }}</strong
        >? Esta ação não pode ser desfeita.
      </p>
      <div modalActions class="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          class="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg"
          (click)="cancelarRemocao()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="min-h-11 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          [attr.aria-label]="'Remover acordo: ' + acordoParaRemover()?.descricao"
          (click)="confirmarRemocao()"
        >
          Remover
        </button>
      </div>
    </app-modal>
  `,
})
export class AcordosListComponent implements OnInit {
  private readonly api = inject(AcordosApiService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly acordos = signal<AcordoResponseDto[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly termo = signal('');
  protected readonly statusFiltro = signal<'TODOS' | StatusOption>('TODOS');
  protected readonly ordenacao = signal<Ordenacao>('vencimento');
  protected readonly pagina = signal(1);

  protected readonly detalheId = signal<string | null>(null);
  protected readonly acordoParaRemover = signal<AcordoResponseDto | null>(null);

  protected readonly temFiltro = computed(
    () => this.termo().trim() !== '' || this.statusFiltro() !== 'TODOS',
  );

  protected readonly filtrados = computed(() => {
    const termo = this.termo().trim().toLowerCase();
    const status = this.statusFiltro();
    const ordenacao = this.ordenacao();

    const itens = this.acordos().filter((acordo) => {
      const combinaTermo =
        !termo ||
        acordo.descricao.toLowerCase().includes(termo) ||
        acordo.devedorId.toLowerCase().includes(termo) ||
        acordo.credorId.toLowerCase().includes(termo);
      const combinaStatus = status === 'TODOS' || acordo.status === status;
      return combinaTermo && combinaStatus;
    });

    return itens.sort((a, b) => {
      if (ordenacao === 'vencimento') {
        return a.dataVencimento.localeCompare(b.dataVencimento);
      }
      if (ordenacao === 'valor') {
        return b.valorEmCentavos - a.valorEmCentavos;
      }
      return a.descricao.localeCompare(b.descricao, 'pt-BR');
    });
  });

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / POR_PAGINA)),
  );

  protected readonly paginaAtual = computed(() =>
    Math.min(Math.max(1, this.pagina()), this.totalPaginas()),
  );

  protected readonly visiveis = computed(() => {
    const inicio = (this.paginaAtual() - 1) * POR_PAGINA;
    return this.filtrados().slice(inicio, inicio + POR_PAGINA);
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.termo.set(params.get('q') ?? '');
      this.pagina.set(1);
    });

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
        error: () => this.erro.set('Não foi possível carregar os acordos. Tente novamente.'),
      });
  }

  protected onTermo(valor: string): void {
    this.termo.set(valor);
    this.pagina.set(1);
  }

  protected onStatus(valor: string): void {
    this.statusFiltro.set(valor as 'TODOS' | StatusOption);
    this.pagina.set(1);
  }

  protected onOrdenacao(valor: string): void {
    this.ordenacao.set(valor as Ordenacao);
    this.pagina.set(1);
  }

  protected limparFiltros(): void {
    this.termo.set('');
    this.statusFiltro.set('TODOS');
    this.pagina.set(1);
  }

  protected anterior(): void {
    this.pagina.update((pagina) => Math.max(1, pagina - 1));
  }

  protected proxima(): void {
    this.pagina.update((pagina) => Math.min(this.totalPaginas(), pagina + 1));
  }

  protected abrirDetalhe(acordo: AcordoResponseDto): void {
    this.detalheId.set(acordo.id);
  }

  protected fecharDetalhe(): void {
    this.detalheId.set(null);
  }

  protected solicitarRemocao(acordo: AcordoResponseDto): void {
    this.acordoParaRemover.set(acordo);
  }

  protected cancelarRemocao(): void {
    this.acordoParaRemover.set(null);
  }

  protected confirmarRemocao(): void {
    const acordo = this.acordoParaRemover();
    if (!acordo) {
      return;
    }

    this.api
      .remover(acordo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.acordos.update((itens) => itens.filter((item) => item.id !== acordo.id));
          this.acordoParaRemover.set(null);
          this.notifications.sucesso('Acordo removido com sucesso.');
        },
        error: () => {
          this.acordoParaRemover.set(null);
          this.notifications.erro('Não foi possível remover o acordo. Tente novamente.');
        },
      });
  }

  protected classeVencimento(acordo: AcordoResponseDto): string {
    return this.atrasado(acordo)
      ? 'px-4 py-3 font-semibold text-danger'
      : 'px-4 py-3 text-text';
  }

  protected atrasado(acordo: AcordoResponseDto): boolean {
    if (acordo.status === 'CONCLUIDO' || acordo.status === 'CANCELADO') {
      return false;
    }
    const hoje = new Date().toISOString().slice(0, 10);
    return acordo.dataVencimento < hoje;
  }

  protected valorEmReais(centavos: number): number {
    return centavos / 100;
  }
}
