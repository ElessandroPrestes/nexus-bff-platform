import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-[60vh] items-center justify-center" aria-labelledby="titulo-404">
      <div
        class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
      >
        <p class="text-xs font-semibold tracking-wide text-muted uppercase">Erro 404</p>
        <h1 id="titulo-404" class="mt-2 text-2xl font-bold text-text">Página não encontrada</h1>
        <p class="mt-2 text-sm text-muted">O endereço acessado não existe ou foi movido.</p>
        <a
          class="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast no-underline transition-opacity hover:opacity-90"
          routerLink="/acordos"
        >
          Ir para os acordos
        </a>
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
