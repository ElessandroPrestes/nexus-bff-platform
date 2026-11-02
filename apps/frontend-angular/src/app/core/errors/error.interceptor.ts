import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';

interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

/**
 * errorInterceptor — tratamento global de erros HTTP.
 *
 * - 401: encerra a sessão e redireciona para o login.
 * - Demais erros: publica notificação acessível e propaga o erro.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          auth.logout();
          void router.navigate(['/login']);
        }
        notifications.erro(mensagemDeErro(error));
      } else {
        notifications.erro('Ocorreu um erro inesperado. Tente novamente.');
      }

      return throwError(() => error);
    }),
  );
};

function mensagemDeErro(error: HttpErrorResponse): string {
  const corpo = error.error as ApiErrorBody | string | null | undefined;

  if (typeof corpo === 'string' && corpo.trim()) {
    return corpo;
  }

  if (corpo && typeof corpo === 'object') {
    const detalhes = corpo.errors?.filter((item) => Boolean(item));
    if (detalhes?.length) {
      return detalhes.join(' ');
    }
    if (corpo.message?.trim()) {
      return corpo.message;
    }
  }

  switch (error.status) {
    case 0:
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    case 401:
      return 'Sessão expirada. Entre novamente para continuar.';
    case 403:
      return 'Você não tem permissão para executar esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 422:
      return 'Dados inválidos. Revise o formulário e tente novamente.';
    default:
      return error.status >= 500
        ? 'O servidor falhou ao processar a solicitação. Tente novamente em instantes.'
        : 'Não foi possível concluir a operação.';
  }
}
