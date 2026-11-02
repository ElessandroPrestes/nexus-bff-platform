import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';

@Component({ template: '' })
class RotaVazia {}

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: 'login', component: RotaVazia }])],
    }).compileComponents();
  });

  it('deve renderizar a marca e a ação de entrada', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.marca')?.textContent).toContain('Nexus');
    expect(compiled.querySelector('a[href="/login"]')?.textContent).toContain('Entrar');
  });

  it('deve exibir navegação de acordos quando autenticado', () => {
    TestBed.inject(AuthService).salvarToken('token-de-teste-com-mais-de-20-caracteres');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.nav a[href="/acordos"]')?.textContent).toContain('Acordos');

    const botoes = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    expect(botoes.some((botao) => botao.textContent?.includes('Sair'))).toBe(true);
  });

  it('não exibe a ação de entrada na rota de login', async () => {
    await TestBed.inject(Router).navigateByUrl('/login');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/login"]')).toBeNull();
  });
});
