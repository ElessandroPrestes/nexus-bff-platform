import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid min-h-screen bg-bg lg:grid-cols-[1.1fr_1fr]" aria-labelledby="titulo-login">
      <aside
        class="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div
          class="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/30 blur-3xl"
          aria-hidden="true"
        ></div>
        <div
          class="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        ></div>

        <div class="relative flex items-center gap-3">
          <span
            class="grid h-10 w-10 place-items-center rounded-xl bg-brand text-lg font-bold text-brand-contrast"
            aria-hidden="true"
            >N</span
          >
          <span class="text-lg font-bold">Nexus</span>
        </div>

        <div class="relative flex flex-col gap-6">
          <h2 class="max-w-md text-3xl font-bold leading-tight">
            Gestão e conciliação de acordos em um só lugar.
          </h2>
          <ul class="flex max-w-md list-none flex-col gap-3 p-0 text-sm text-slate-300">
            <li class="flex items-start gap-3">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true"></span>
              Visão consolidada de valores em aberto, inadimplência e acordos concluídos.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true"></span>
              Busca, filtros e detalhes dos acordos sem sair da lista.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true"></span>
              Acesso protegido por token JWT validado no BFF.
            </li>
          </ul>
        </div>

        <p class="relative text-xs text-slate-400">Nexus Core · Plataforma de acordos</p>
      </aside>

      <div class="flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="mb-8 flex items-center gap-3 lg:hidden">
            <span
              class="grid h-11 w-11 place-items-center rounded-xl bg-brand text-lg font-bold text-brand-contrast"
              aria-hidden="true"
              >N</span
            >
            <span class="text-lg font-bold text-text">Nexus</span>
          </div>

          <h1 id="titulo-login" class="text-2xl font-bold text-text">Entrar no Nexus</h1>
          <p class="mt-1 text-sm text-muted">Gestão e conciliação de acordos</p>

          <p class="mt-6 text-sm text-muted">
            Informe o token JWT emitido pelo provedor de identidade para acessar os acordos.
          </p>

          <form [formGroup]="form" (ngSubmit)="enviar()" novalidate class="mt-5 space-y-5">
            <div>
              <div class="mb-1 flex items-center justify-between gap-2">
                <label for="token" class="block text-sm font-medium text-text">Token JWT</label>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                    (click)="alternarVisibilidade()"
                  >
                    {{ oculto() ? 'Mostrar' : 'Ocultar' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                    (click)="colar()"
                  >
                    Colar
                  </button>
                </div>
              </div>
              <input
                id="token"
                [type]="oculto() ? 'password' : 'text'"
                formControlName="token"
                autocomplete="off"
                spellcheck="false"
                placeholder="eyJhbGciOi…"
                class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-sm text-text shadow-sm transition outline-none placeholder:text-muted focus:border-transparent focus:ring-2 focus:ring-brand"
                [class.border-danger]="invalido()"
                [class.ring-danger]="invalido()"
                [attr.aria-invalid]="invalido()"
                [attr.aria-describedby]="invalido() ? 'token-ajuda token-erro' : 'token-ajuda'"
              />
              <p id="token-ajuda" class="mt-1 text-xs text-muted">
                O token é enviado apenas nas chamadas ao BFF.
              </p>
              <details class="mt-2 text-xs text-muted">
                <summary class="cursor-pointer font-semibold text-brand">Como obter meu token?</summary>
                <p class="mt-1">
                  Solicite o JWT ao provedor de identidade configurado para a sua organização. Ele é
                  enviado apenas nas chamadas ao BFF e fica salvo neste navegador.
                </p>
              </details>
              @if (invalido()) {
                <p id="token-erro" class="mt-1 text-xs font-medium text-danger">
                  Informe um token com pelo menos 20 caracteres.
                </p>
              }
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-brand py-3 font-semibold text-brand-contrast transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60"
              [disabled]="entrando()"
              [attr.aria-busy]="entrando()"
            >
              {{ entrando() ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>

          <p class="mt-6 text-center text-xs text-muted">
            Ao entrar, você concorda com o uso do token apenas para autenticação no BFF.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly enviado = signal(false);
  protected readonly entrando = signal(false);
  protected readonly oculto = signal(true);
  protected readonly form = this.fb.group({
    token: ['', [Validators.required, Validators.minLength(20)]],
  });

  protected invalido(): boolean {
    const controle = this.form.controls.token;
    return controle.invalid && (controle.touched || this.enviado());
  }

  protected alternarVisibilidade(): void {
    this.oculto.update((valor) => !valor);
  }

  protected async colar(): Promise<void> {
    try {
      const texto = await navigator.clipboard.readText();
      if (texto.trim()) {
        this.form.controls.token.setValue(texto.trim());
      }
    } catch {
      // Área de transferência indisponível; o usuário pode colar manualmente.
    }
  }

  protected enviar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.entrando.set(true);
    this.auth.salvarToken(this.form.controls.token.value);
    const destino = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
    void this.router.navigateByUrl(destino);
  }
}
