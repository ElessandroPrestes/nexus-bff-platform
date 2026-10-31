import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — guard de autorização por papel (RBAC).
 *
 * - Aplicado após JwtAuthGuard (o usuário já está autenticado).
 * - Se nenhum papel é exigido na rota, permite o acesso.
 * - Compara os papéis do token JWT com os papéis exigidos pelo decorator @Roles().
 * - Segue OWASP A01 (Broken Access Control).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sem restrição de papel → permite acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: { roles?: string[] } }>();
    const userRoles = user?.roles;

    if (!userRoles) {
      throw new ForbiddenException('Acesso negado: sem papéis atribuídos');
    }

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Acesso negado: papel insuficiente');
    }

    return true;
  }
}
