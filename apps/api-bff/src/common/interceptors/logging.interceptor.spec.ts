import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function buildContext(overrides?: {
  method?: string;
  url?: string;
  ip?: string;
  user?: { sub?: string };
  statusCode?: number;
}): ExecutionContext {
  const req = {
    method: overrides?.method ?? 'GET',
    url: overrides?.url ?? '/api/v1/acordos',
    ip: overrides?.ip ?? '127.0.0.1',
    user: overrides?.user,
  };
  const res = { statusCode: overrides?.statusCode ?? 200 };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(req),
      getResponse: jest.fn().mockReturnValue(res),
    }),
  } as unknown as ExecutionContext;
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve logar requisição bem-sucedida com campos corretos', (done) => {
    const context = buildContext({ method: 'GET', url: '/api/v1/acordos', statusCode: 200 });
    const next: CallHandler = { handle: () => of({ data: [] }) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(logSpy).toHaveBeenCalledTimes(1);
        const logArg: string = logSpy.mock.calls[0][0] as string;
        const parsed = JSON.parse(logArg) as Record<string, unknown>;
        expect(parsed['type']).toBe('http_access');
        expect(parsed['method']).toBe('GET');
        expect(parsed['url']).toBe('/api/v1/acordos');
        expect(parsed['statusCode']).toBe(200);
        expect(typeof parsed['latencyMs']).toBe('number');
        expect(parsed['userId']).toBe('anonymous');
        done();
      },
    });
  });

  it('deve incluir userId do token autenticado', (done) => {
    const context = buildContext({ user: { sub: 'user-42' } });
    const next: CallHandler = { handle: () => of({}) };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        const logArg: string = logSpy.mock.calls[0][0] as string;
        const parsed = JSON.parse(logArg) as Record<string, unknown>;
        expect(parsed['userId']).toBe('user-42');
        done();
      },
    });
  });

  it('deve logar erro quando o handler lança exceção', (done) => {
    const context = buildContext({ method: 'POST', url: '/api/v1/acordos' });
    const error = Object.assign(new Error('Validation failed'), { status: 400 });
    const next: CallHandler = { handle: () => throwError(() => error) };

    interceptor.intercept(context, next).subscribe({
      error: () => {
        expect(errorSpy).toHaveBeenCalledTimes(1);
        const errorArg: string = errorSpy.mock.calls[0][0] as string;
        const parsed = JSON.parse(errorArg) as Record<string, unknown>;
        expect(parsed['type']).toBe('http_error');
        expect(parsed['statusCode']).toBe(400);
        expect(parsed['error']).toBe('Validation failed');
        done();
      },
    });
  });
});
