import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ESTILOS: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  ATIVO: 'bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300',
  CONCLUIDO: 'bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300',
  CANCELADO: 'bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
  INADIMPLENTE: 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300',
};

const ROTULOS: Record<string, string> = {
  PENDENTE: 'Pendente',
  ATIVO: 'Ativo',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  INADIMPLENTE: 'Inadimplente',
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="'badge ' + estilo()">{{ rotulo() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<string>();

  protected readonly estilo = computed(
    () => ESTILOS[this.status()] ?? ESTILOS['CANCELADO'],
  );
  protected readonly rotulo = computed(() => ROTULOS[this.status()] ?? this.status());
}
