import { SetMetadata } from '@nestjs/common';

/**
 * Chave de metadados que marca uma rota como pública.
 * Lida pelo JwtAuthGuard para bypassar a autenticação.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — decorator que marca um controller ou handler como público.
 * Rotas marcadas não exigem token JWT.
 *
 * @example
 * @Public()
 * @Get('health')
 * health() { return { status: 'ok' }; }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
