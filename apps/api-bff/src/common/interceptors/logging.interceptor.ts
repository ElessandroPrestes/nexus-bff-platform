import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Contratos mínimos do request/response HTTP usados neste interceptor.
 * Evitam dependência de tipos do Express no build do BFF.
 */
interface HttpRequestLike {
  method?: string;
  url?: string;
  ip?: string;
  user?: { sub?: string };
}

interface HttpResponseLike {
  statusCode?: number;
}

/**
 * LoggingInterceptor — interceptor global de latência e auditoria estruturada.
 *
 * Emite um log estruturado (JSON-friendly via NestJS Logger) para cada requisição:
 * - método HTTP, rota, IP do cliente
 * - status HTTP da resposta
 * - latência em milissegundos
 * - ID do usuário autenticado (se disponível no request)
 *
 * Atende OWASP A09 (Security Logging and Monitoring Failures).
 * Meta de latência do BFF: < 300ms (SPEC-001, seção 8).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<HttpRequestLike>();
    const res = httpCtx.getResponse<HttpResponseLike>();

    const { method, url, ip } = req;
    const userId: string = req.user?.sub ?? 'anonymous';
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const latencyMs = Date.now() - startedAt;
          const statusCode = res.statusCode;

          this.logger.log(
            JSON.stringify({
              type: 'http_access',
              method,
              url,
              statusCode,
              latencyMs,
              userId,
              ip,
            }),
          );

          if (latencyMs > 300) {
            this.logger.warn(
              JSON.stringify({
                type: 'slow_request',
                method,
                url,
                latencyMs,
                userId,
              }),
            );
          }
        },
        error: (err: { status?: number; message?: string }) => {
          const latencyMs = Date.now() - startedAt;
          const statusCode: number = err?.status ?? 500;

          this.logger.error(
            JSON.stringify({
              type: 'http_error',
              method,
              url,
              statusCode,
              latencyMs,
              userId,
              ip,
              error: err?.message ?? 'Unknown error',
            }),
          );
        },
      }),
    );
  }
}
