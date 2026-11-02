import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';
import { errorInterceptor } from './error.interceptor';

@Component({ standalone: true, template: '' })
class StubComponent {}

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;
  let notifications: NotificationService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: StubComponent }]),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    notifications = TestBed.inject(NotificationService);
    router = TestBed.inject(Router);
  });

  afterEach(() => controller.verify());

  it('deve encerrar a sessão e redirecionar em 401', () => {
    auth.salvarToken('token-expirado');
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/v1/acordos').subscribe({ error: () => undefined });

    const req = controller.expectOne('/api/v1/acordos');
    req.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.token()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login']);
    expect(notifications.itens().slice(-1)[0]?.message).toBe('Token expirado');
  });

  it('deve publicar mensagem amigável em erro de rede', () => {
    http.get('/api/v1/acordos').subscribe({ error: () => undefined });

    const req = controller.expectOne('/api/v1/acordos');
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    expect(notifications.itens().slice(-1)[0]?.message).toContain('Não foi possível conectar');
  });

  it('deve usar mensagem padrão para 500', () => {
    http.get('/api/v1/acordos').subscribe({ error: () => undefined });

    const req = controller.expectOne('/api/v1/acordos');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(notifications.itens().slice(-1)[0]?.message).toContain('O servidor falhou');
  });
});
