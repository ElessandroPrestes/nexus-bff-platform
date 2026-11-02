import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorage.clear();
    navigateByUrl = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: { navigateByUrl } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();
  });

  it('deve exibir erro e não autenticar com token vazio', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    botao.click();
    fixture.detectChanges();

    const auth = TestBed.inject(AuthService);
    expect(auth.autenticado()).toBe(false);
    expect(fixture.nativeElement.querySelector('#token-erro')).not.toBeNull();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('deve salvar o token e navegar ao autenticar', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('#token') as HTMLTextAreaElement;
    textarea.value = 'token-de-teste-com-mais-de-20-caracteres';
    textarea.dispatchEvent(new Event('input'));

    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    botao.click();
    fixture.detectChanges();

    const auth = TestBed.inject(AuthService);
    expect(auth.token()).toBe('token-de-teste-com-mais-de-20-caracteres');
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('alterna a visibilidade do token', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#token') as HTMLInputElement;
    expect(input.type).toBe('password');

    const botao = (
      Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]
    ).find((item) => item.textContent?.trim() === 'Mostrar') as HTMLButtonElement;
    botao.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });
});
