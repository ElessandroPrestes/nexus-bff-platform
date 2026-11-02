import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'sucesso' | 'erro' | 'info';

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  message: string;
}

/**
 * NotificationService — fila reativa de mensagens globais para o usuário.
 * Consumida pelo componente `app-notification-list` via signal.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly itensInternos = signal<AppNotification[]>([]);
  private sequencia = 0;

  readonly itens = this.itensInternos.asReadonly();

  sucesso(message: string): void {
    this.publicar('sucesso', message, true);
  }

  erro(message: string): void {
    this.publicar('erro', message, false);
  }

  info(message: string): void {
    this.publicar('info', message, true);
  }

  dispensar(id: number): void {
    this.itensInternos.update((itens) => itens.filter((item) => item.id !== id));
  }

  limpar(): void {
    this.itensInternos.set([]);
  }

  private publicar(kind: NotificationKind, message: string, autoDispensar: boolean): void {
    const id = ++this.sequencia;
    this.itensInternos.update((itens) => [...itens.slice(-2), { id, kind, message }]);

    if (autoDispensar) {
      setTimeout(() => this.dispensar(id), 5000);
    }
  }
}
