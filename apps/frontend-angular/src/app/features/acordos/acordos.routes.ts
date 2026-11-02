import { Routes } from '@angular/router';

export const ACORDOS_ROUTES: Routes = [
  {
    path: 'novo',
    title: 'Novo acordo — Nexus',
    loadComponent: () =>
      import('./acordo-form/acordo-form').then((modulo) => modulo.AcordoFormComponent),
  },
  {
    path: '',
    title: 'Acordos — Nexus',
    loadComponent: () =>
      import('./acordos-list/acordos-list').then((modulo) => modulo.AcordosListComponent),
  },
];
