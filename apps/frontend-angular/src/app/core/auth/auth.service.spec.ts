import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve iniciar sem token', () => {
    const service = TestBed.inject(AuthService);

    expect(service.token()).toBeNull();
    expect(service.autenticado()).toBe(false);
  });

  it('deve salvar o token e persistir em localStorage', () => {
    const service = TestBed.inject(AuthService);

    service.salvarToken('  token-valido  ');

    expect(service.token()).toBe('token-valido');
    expect(service.autenticado()).toBe(true);
    expect(localStorage.getItem('nexus.token')).toBe('token-valido');
  });

  it('deve ignorar token vazio', () => {
    const service = TestBed.inject(AuthService);

    service.salvarToken('   ');

    expect(service.token()).toBeNull();
  });

  it('deve limpar o token no logout', () => {
    const service = TestBed.inject(AuthService);
    service.salvarToken('token-valido');

    service.logout();

    expect(service.token()).toBeNull();
    expect(localStorage.getItem('nexus.token')).toBeNull();
  });

  it('deve extrair o usuário do payload do JWT', () => {
    const service = TestBed.inject(AuthService);
    const payload = btoa(JSON.stringify({ email: 'dev@nexus.local' }))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    service.salvarToken(`header.${payload}.assinatura`);

    expect(service.usuario()).toBe('dev@nexus.local');
  });

  it('deve retornar null quando o token não tem payload válido', () => {
    const service = TestBed.inject(AuthService);

    service.salvarToken('token-sem-formato-jwt');

    expect(service.usuario()).toBeNull();
  });
});
