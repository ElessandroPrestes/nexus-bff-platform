import { SetMetadata } from '@nestjs/common';

/**
 * Chave de metadados que lista os papéis exigidos pela rota.
 * Lida pelo RolesGuard.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) — decorator que restringe o acesso a papéis específicos.
 * Deve ser usado em conjunto com RolesGuard (aplicado após JwtAuthGuard).
 *
 * @param roles - Um ou mais papéis aceitos (ex.: 'admin', 'gestor').
 *
 * @example
 * @Roles('admin', 'gestor')
 * @Delete(':id')
 * remove(@Param('id') id: string) { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
