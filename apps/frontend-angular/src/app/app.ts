import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { NotificationList } from './core/notifications/notification-list';
import { ThemeService } from './core/theme/theme.service';
import { Drawer } from './core/ui/drawer';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationList, Drawer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly telaLogin = computed(() => this.url().startsWith('/login'));
  protected readonly menuAberto = signal(false);
  protected readonly busca = signal('');

  protected readonly usuario = computed(() => this.auth.usuario() ?? 'Usuário');
  protected readonly iniciais = computed(() => {
    const partes = this.usuario()
      .split(/[@\s._-]+/)
      .filter(Boolean);
    const primeira = partes[0]?.[0] ?? 'U';
    const segunda = partes[1]?.[0] ?? '';
    return (primeira + segunda).toUpperCase();
  });

  protected abrirMenu(): void {
    this.menuAberto.set(true);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }

  protected onBusca(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected buscar(evento: Event): void {
    evento.preventDefault();
    const termo = this.busca().trim();
    void this.router.navigate(['/acordos'], { queryParams: termo ? { q: termo } : {} });
    this.menuAberto.set(false);
  }

  protected sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
