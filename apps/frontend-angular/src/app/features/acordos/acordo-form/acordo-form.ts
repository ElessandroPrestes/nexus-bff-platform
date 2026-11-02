import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { CreateAcordoDto, StatusAcordo, TipoPagamento } from '@nexus/common';
import { finalize } from 'rxjs';
import { AcordosApiService } from '../../../core/api/acordos-api.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { CurrencyInput } from '../../../core/ui/currency-input';
import {
  ROTULOS_STATUS,
  ROTULOS_TIPO_PAGAMENTO,
  STATUS_ACORDO,
  TIPO_PAGAMENTO,
} from '../acordo-options';

type StatusOption = (typeof STATUS_ACORDO)[number];
type TipoOption = (typeof TIPO_PAGAMENTO)[number];
type Campo =
  | 'descricao'
  | 'valorEmCentavos'
  | 'dataVencimento'
  | 'status'
  | 'tipoPagamento'
  | 'numeroParcelas'
  | 'devedorId'
  | 'credorId';

@Component({
  selector: 'app-acordo-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col gap-6" aria-labelledby="titulo-novo-acordo">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-wide text-muted uppercase">Acordos</p>
          <h1 id="titulo-novo-acordo" class="text-2xl font-bold text-text">Novo acordo</h1>
          <p class="text-sm text-muted">
            Cadastre um acordo. Campos marcados com * são obrigatórios.
          </p>
        </div>
        <a
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text no-underline transition-colors hover:bg-bg"
          routerLink="/acordos"
        >
          Voltar
        </a>
      </header>

      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate class="flex flex-col gap-6">
        @if (enviado() && form.invalid) {
          <div
            class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
            role="alert"
          >
            Corrija os campos destacados para salvar o acordo.
          </div>
        }

        <fieldset class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <legend class="px-2 text-sm font-semibold text-text">Dados do acordo</legend>
          <div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="md:col-span-2">
              <label for="descricao" class="mb-1 block text-sm font-medium text-text"
                >Descrição *</label
              >
              <input
                id="descricao"
                type="text"
                formControlName="descricao"
                maxlength="500"
                [class]="classeCampo('descricao')"
                [attr.aria-invalid]="invalido('descricao')"
                aria-describedby="descricao-erro"
              />
              @if (invalido('descricao')) {
                <p id="descricao-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe uma descrição entre 5 e 500 caracteres.
                </p>
              }
            </div>

            <div>
              <label for="valorEmCentavos" class="mb-1 block text-sm font-medium text-text"
                >Valor *</label
              >
              <app-currency-input
                inputId="valorEmCentavos"
                formControlName="valorEmCentavos"
                [ariaInvalid]="invalido('valorEmCentavos')"
                ariaDescribedby="valor-ajuda valor-erro"
                [inputClass]="classeCampo('valorEmCentavos')"
              />
              <p id="valor-ajuda" class="mt-1 text-xs text-muted">
                Digite os dígitos; a máscara aplica o formato em reais.
              </p>
              @if (invalido('valorEmCentavos')) {
                <p id="valor-erro" class="mt-1 text-xs font-medium text-danger">
                  O valor deve ser maior que zero.
                </p>
              }
            </div>

            <div>
              <label for="dataVencimento" class="mb-1 block text-sm font-medium text-text"
                >Vencimento *</label
              >
              <input
                id="dataVencimento"
                type="date"
                formControlName="dataVencimento"
                [class]="classeCampo('dataVencimento')"
                [attr.aria-invalid]="invalido('dataVencimento')"
                aria-describedby="vencimento-erro"
              />
              @if (invalido('dataVencimento')) {
                <p id="vencimento-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe a data de vencimento.
                </p>
              }
            </div>

            <div>
              <label for="numeroParcelas" class="mb-1 block text-sm font-medium text-text"
                >Parcelas *</label
              >
              <input
                id="numeroParcelas"
                type="number"
                formControlName="numeroParcelas"
                min="1"
                max="360"
                step="1"
                [class]="classeCampo('numeroParcelas')"
                [attr.aria-invalid]="invalido('numeroParcelas')"
                aria-describedby="parcelas-erro"
              />
              @if (invalido('numeroParcelas')) {
                <p id="parcelas-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe de 1 a 360 parcelas.
                </p>
              }
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <legend class="px-2 text-sm font-semibold text-text">Partes</legend>
          <div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label for="devedorId" class="mb-1 block text-sm font-medium text-text"
                >ID do devedor *</label
              >
              <input
                id="devedorId"
                type="text"
                formControlName="devedorId"
                [class]="classeCampo('devedorId')"
                [attr.aria-invalid]="invalido('devedorId')"
                aria-describedby="devedor-erro"
              />
              @if (invalido('devedorId')) {
                <p id="devedor-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe o identificador do devedor.
                </p>
              }
            </div>

            <div>
              <label for="credorId" class="mb-1 block text-sm font-medium text-text"
                >ID do credor *</label
              >
              <input
                id="credorId"
                type="text"
                formControlName="credorId"
                [class]="classeCampo('credorId')"
                [attr.aria-invalid]="invalido('credorId')"
                aria-describedby="credor-erro"
              />
              @if (invalido('credorId')) {
                <p id="credor-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe o identificador do credor.
                </p>
              }
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <legend class="px-2 text-sm font-semibold text-text">Pagamento</legend>
          <div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label for="tipoPagamento" class="mb-1 block text-sm font-medium text-text"
                >Forma de pagamento *</label
              >
              <select
                id="tipoPagamento"
                formControlName="tipoPagamento"
                [class]="classeCampo('tipoPagamento')"
                [attr.aria-invalid]="invalido('tipoPagamento')"
              >
                @for (tipo of tipoOpcoes; track tipo) {
                  <option [value]="tipo">{{ rotulosTipo[tipo] }}</option>
                }
              </select>
            </div>

            <div>
              <label for="status" class="mb-1 block text-sm font-medium text-text">Status *</label>
              <select
                id="status"
                formControlName="status"
                [class]="classeCampo('status')"
                [attr.aria-invalid]="invalido('status')"
              >
                @for (status of statusOpcoes; track status) {
                  <option [value]="status">{{ rotulosStatus[status] }}</option>
                }
              </select>
            </div>
          </div>
        </fieldset>

        <div
          class="sticky bottom-0 z-10 -mx-1 flex flex-wrap gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur"
        >
          <button
            type="submit"
            class="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90 disabled:opacity-60 sm:flex-none"
            [disabled]="salvando()"
          >
            {{ salvando() ? 'Salvando…' : 'Salvar acordo' }}
          </button>
          <a
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text no-underline transition-colors hover:bg-bg"
            routerLink="/acordos"
          >
            Cancelar
          </a>
        </div>
      </form>
    </section>
  `,
})
export class AcordoFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AcordosApiService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusOpcoes = STATUS_ACORDO;
  protected readonly tipoOpcoes = TIPO_PAGAMENTO;
  protected readonly rotulosStatus = ROTULOS_STATUS;
  protected readonly rotulosTipo = ROTULOS_TIPO_PAGAMENTO;
  protected readonly enviado = signal(false);
  protected readonly salvando = signal(false);

  protected readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    valorEmCentavos: [1, [Validators.required, Validators.min(1)]],
    dataVencimento: ['', [Validators.required]],
    status: this.fb.control<StatusOption>('PENDENTE', [Validators.required]),
    tipoPagamento: this.fb.control<TipoOption>('PIX', [Validators.required]),
    numeroParcelas: [1, [Validators.required, Validators.min(1), Validators.max(360)]],
    devedorId: ['', [Validators.required]],
    credorId: ['', [Validators.required]],
  });

  protected invalido(campo: Campo): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.touched || this.enviado());
  }

  protected classeCampo(campo: Campo): string {
    const base =
      'w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-text shadow-sm transition outline-none focus:border-transparent focus:ring-2';
    return this.invalido(campo)
      ? `${base} border-danger focus:ring-danger`
      : `${base} border-border focus:ring-brand`;
  }

  protected salvar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const dto: CreateAcordoDto = {
      descricao: valores.descricao,
      valorEmCentavos: valores.valorEmCentavos,
      dataVencimento: valores.dataVencimento,
      status: valores.status as StatusAcordo,
      tipoPagamento: valores.tipoPagamento as TipoPagamento,
      numeroParcelas: valores.numeroParcelas,
      devedorId: valores.devedorId,
      credorId: valores.credorId,
    };

    this.salvando.set(true);
    this.api
      .criar(dto)
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notifications.sucesso('Acordo cadastrado com sucesso.');
          void this.router.navigate(['/acordos']);
        },
      });
  }
}
