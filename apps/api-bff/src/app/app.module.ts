import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcordosModule } from '../acordos/acordos.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const MONGODB_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/nexus';

/**
 * AppModule — módulo raiz do BFF.
 *
 * Guards globais (ordem de execução):
 *  1. ThrottlerGuard — rate limiting (OWASP A04).
 *  2. JwtAuthGuard  — autenticação JWT (OWASP A01). Rotas @Public() são ignoradas.
 *  3. RolesGuard    — autorização RBAC (OWASP A01).
 *
 * Interceptor global:
 *  - LoggingInterceptor — latência + auditoria estruturada (OWASP A09).
 *
 * Persistência:
 *  - MongooseModule.forRoot conecta ao MongoDB via MONGODB_URI (env).
 *    Fallback para localhost em desenvolvimento local sem Docker.
 */
@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI, {
      serverSelectionTimeoutMS: Number(
        process.env['MONGODB_SERVER_SELECTION_TIMEOUT_MS'] ?? 5000,
      ),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    JwtAuthModule,
    AcordosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Autenticação JWT global (bypass via @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Autorização RBAC global (bypass se sem @Roles())
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Logging de latência e auditoria global
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
