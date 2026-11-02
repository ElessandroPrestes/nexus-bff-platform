import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-pulse space-y-3" aria-hidden="true">
      @for (item of itens(); track item) {
        <div class="h-4 rounded-md bg-border/70" [class]="item === 0 ? 'w-1/3' : 'w-full'"></div>
      }
    </div>
  `,
})
export class Skeleton {
  readonly linhas = input<number>(3);
  protected readonly itens = computed(() => Array.from({ length: this.linhas() }, (_, i) => i));
}
