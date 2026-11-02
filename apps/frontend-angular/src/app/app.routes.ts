import { Route } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Visão geral — Nexus',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((modulo) => modulo.DashboardComponent),
  },
  {
    path: 'login',
    title: 'Entrar — Nexus',
    loadComponent: () =>
      import('./features/auth/login/login').then((modulo) => modulo.LoginComponent),
  },
  {
    path: 'acordos',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/acordos/acordos.routes').then((modulo) => modulo.ACORDOS_ROUTES),
  },
  {
    path: '**',
    title: 'Página não encontrada — Nexus',
    loadComponent: () =>
      import('./features/not-found/not-found').then((modulo) => modulo.NotFoundComponent),
  },
];
