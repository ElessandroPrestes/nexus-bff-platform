import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  it('deve aplicar o tema inicial no elemento raiz', () => {
    const service = TestBed.inject(ThemeService);

    expect(document.documentElement.dataset['theme']).toBe(service.tema());
  });

  it('deve alternar entre claro e escuro e persistir', () => {
    localStorage.setItem('nexus.theme', 'light');
    const service = TestBed.inject(ThemeService);

    expect(service.escuro()).toBe(false);

    service.alternar();

    expect(service.tema()).toBe('dark');
    expect(service.escuro()).toBe(true);
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('nexus.theme')).toBe('dark');
  });
});
