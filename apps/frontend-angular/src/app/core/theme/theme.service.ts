import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'nexus.theme';

/**
 * ThemeService — tema claro/escuro acessível.
 * Persiste a preferência e aplica `data-theme` no elemento raiz.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly temaInterno = signal<Theme>(this.temaInicial());

  readonly tema = this.temaInterno.asReadonly();
  readonly escuro = computed(() => this.temaInterno() === 'dark');

  constructor() {
    this.aplicar(this.temaInterno());
  }

  alternar(): void {
    const proximo: Theme = this.escuro() ? 'light' : 'dark';
    this.temaInterno.set(proximo);
    this.aplicar(proximo);
    try {
      localStorage.setItem(THEME_KEY, proximo);
    } catch {
      // Preferência permanece apenas em memória.
    }
  }

  private aplicar(tema: Theme): void {
    this.document.documentElement.dataset['theme'] = tema;
  }

  private temaInicial(): Theme {
    try {
      const salvo = localStorage.getItem(THEME_KEY);
      if (salvo === 'light' || salvo === 'dark') {
        return salvo;
      }
    } catch {
      // Sem armazenamento: cai no sistema.
    }

    const prefereEscuro =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefereEscuro ? 'dark' : 'light';
  }
}
