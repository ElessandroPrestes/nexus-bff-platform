import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => controller.verify());

  it('deve anexar o Bearer token quando autenticado', () => {
    auth.salvarToken('meu-token');

    http.get('/api/v1/acordos').subscribe();

    const req = controller.expectOne('/api/v1/acordos');
    expect(req.request.headers.get('Authorization')).toBe('Bearer meu-token');
    req.flush({});
  });

  it('não deve anexar token em rotas de autenticação', () => {
    auth.salvarToken('meu-token');

    http.post('/api/auth/login', {}).subscribe();

    const req = controller.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não deve anexar token quando não autenticado', () => {
    http.get('/api/v1/acordos').subscribe();

    const req = controller.expectOne('/api/v1/acordos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
