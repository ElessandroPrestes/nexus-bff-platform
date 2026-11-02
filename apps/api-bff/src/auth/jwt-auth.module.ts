import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * JwtAuthModule — módulo de autenticação/autorização do BFF.
 *
 * Responsabilidades:
 * - Registra a estratégia JWT (passport-jwt).
 * - Exporta JwtAuthGuard e RolesGuard para uso no AppModule.
 *
 * O segredo JWT é lido em runtime de process.env.JWT_SECRET (nunca hardcoded).
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, PassportModule],
})
export class JwtAuthModule {}
