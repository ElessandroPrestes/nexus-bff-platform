import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Payload esperado no JWT — alinhado com SPEC-001 (D-004: provedor a definir).
 * Campos mínimos: sub (userId), roles.
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * JwtStrategy — valida tokens JWT Bearer via passport-jwt.
 *
 * - Extrai o token do header Authorization: Bearer <token>.
 * - Verifica a assinatura com JWT_SECRET (variável de ambiente — nunca commitada).
 * - Rejeita tokens expirados.
 * - O objeto retornado por validate() é injetado em req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env['JWT_SECRET'];

    if (!secret) {
      throw new UnauthorizedException(
        'JWT_SECRET não definido. Configure a variável de ambiente antes de iniciar o servidor.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !Array.isArray(payload.roles)) {
      throw new UnauthorizedException('Token JWT com claims inválidas');
    }
    return payload;
  }
}
