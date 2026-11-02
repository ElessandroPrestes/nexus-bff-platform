import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { NotificationKind } from './notification.service';
import { NotificationService } from './notification.service';

const CLASSES_POR_TIPO: Record<NotificationKind, string> = {
  sucesso: 'border-success/30 bg-surface text-text',
  erro: 'border-danger/30 bg-surface text-text',
  info: 'border-brand/30 bg-surface text-text',
};

const CORES_POR_TIPO: Record<NotificationKind, string> = {
  sucesso: 'text-success',
  erro: 'text-danger',
  info: 'text-brand',
};

@Component({
  selector: 'app-notification-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (notifications.itens().length > 0) {
      <section
        class="fixed right-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        aria-label="Notificações"
        aria-live="polite"
      >
        @for (item of notifications.itens(); track item.id) {
          <div
            [class]="
              'toast-item relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg ' +
              classesPorTipo[item.kind]
            "
            [attr.role]="item.kind === 'erro' ? 'alert' : 'status'"
          >
            <span [class]="'mt-0.5 shrink-0 ' + coresPorTipo[item.kind]" aria-hidden="true">
              @switch (item.kind) {
                @case ('sucesso') {
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.5 12.5 2.5 2.5 4.5-5" />
                  </svg>
                }
                @case ('erro') {
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path stroke-linecap="round" d="M12 8v5m0 3h.01" />
                  </svg>
                }
                @default {
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path stroke-linecap="round" d="M12 11v5m0-8h.01" />
                  </svg>
                }
              }
            </span>

            <p class="flex-1 text-sm font-medium">{{ item.message }}</p>
            <button
              type="button"
              class="ml-auto rounded-md text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-brand"
              [attr.aria-label]="'Dispensar notificação: ' + item.message"
              (click)="notifications.dispensar(item.id)"
            >
              <span aria-hidden="true">×</span>
            </button>

            @if (item.kind !== 'erro') {
              <span class="toast-progress" aria-hidden="true"></span>
            }
          </div>
        }
      </section>
    }
  `,
})
export class NotificationList {
  protected readonly notifications = inject(NotificationService);
  protected readonly classesPorTipo = CLASSES_POR_TIPO;
  protected readonly coresPorTipo = CORES_POR_TIPO;
}
