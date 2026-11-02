import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const TONS: Record<string, string> = {
  neutral: 'text-text',
  brand: 'text-brand',
  danger: 'text-danger',
  success: 'text-success',
};

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p class="text-xs font-semibold tracking-wide text-muted uppercase">{{ rotulo() }}</p>
      <p [class]="'mt-2 text-2xl font-bold tabular-nums ' + tomClasse()">{{ valor() }}</p>
      @if (detalhe()) {
        <p class="mt-1 text-xs text-muted">{{ detalhe() }}</p>
      }
    </div>
  `,
})
export class KpiCard {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalhe = input<string>('');
  readonly tom = input<string>('neutral');

  protected readonly tomClasse = computed(() => TONS[this.tom()] ?? TONS['neutral']);
}
