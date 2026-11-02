import { computed, Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'nexus.token';

/**
 * AuthService — estado de autenticação do frontend.
 *
 * Provisório: armazena o JWT fornecido pelo usuário/provedor (D-004).
 * Não valida assinatura — a validação é responsabilidade do BFF.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenInterno = signal<string | null>(this.lerToken());

  readonly token = this.tokenInterno.asReadonly();
  readonly autenticado = computed(() => Boolean(this.tokenInterno()));
  readonly usuario = computed(() => this.lerUsuario(this.tokenInterno()));

  salvarToken(token: string): void {
    const normalizado = token.trim();
    if (!normalizado) {
      return;
    }
    try {
      localStorage.setItem(TOKEN_KEY, normalizado);
    } catch {
      // Armazenamento indisponível (modo privado); mantém apenas em memória.
    }
    this.tokenInterno.set(normalizado);
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignora indisponibilidade do armazenamento.
    }
    this.tokenInterno.set(null);
  }

  private lerToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private lerUsuario(token: string | null): string | null {
    if (!token) {
      return null;
    }

    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }
      const normalizado = payload.replace(/-/g, '+').replace(/_/g, '/');
      const comPadding = normalizado.padEnd(Math.ceil(normalizado.length / 4) * 4, '=');
      const json = JSON.parse(atob(comPadding)) as { email?: string; sub?: string };
      return json.email ?? json.sub ?? null;
    } catch {
      return null;
    }
  }
}
