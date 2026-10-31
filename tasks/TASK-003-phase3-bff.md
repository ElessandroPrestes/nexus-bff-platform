# TASK-003 — Fase 3: BFF SOLID com Guards, Interceptors e AcordosModule

## Metadados

| Campo          | Valor                       |
| -------------- | --------------------------- |
| ID             | TASK-003                    |
| SPEC           | SPEC-001 (seção 5 — Fase 3) |
| Autor          | Agente                      |
| Status         | Concluída                   |
| Prioridade     | Alta                        |
| Depende de     | TASK-002 (concluída)        |
| Data de início | 2026-10-29                  |

## 1. Descrição

Implementar a camada BFF (`apps/api-bff`) com controles OWASP e princípios SOLID:

- **`JwtAuthGuard`** — guard global que protege rotas por padrão (JWT Bearer).
- **`RolesGuard`** — guard que restringe por papel (`@Roles`).
- **`@Public`** — decorator que marca rotas como públicas (bypass do JwtAuthGuard).
- **`@Roles`** — decorator de metadados de autorização por papel.
- **`LoggingInterceptor`** — interceptor global de latência e auditoria estruturada.
- **`JwtAuthModule`** — módulo que registra `JwtStrategy` (passport-jwt) e exporta o Guard.
- **`AcordosModule`** — CRUD mínimo de Acordos com Controller enxuto, Service especializado e Repository em memória (stub — MongoDB na Fase 4).

## 2. Escopo

### Arquivos a criar

```
apps/api-bff/src/
├── auth/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── jwt-auth.module.ts
├── common/
│   └── interceptors/
│       └── logging.interceptor.ts
└── acordos/
    ├── interfaces/
    │   └── acordos-repository.interface.ts
    ├── repositories/
    │   └── in-memory-acordos.repository.ts
    ├── acordos.controller.ts
    ├── acordos.service.ts
    └── acordos.module.ts
```

### Arquivos a modificar

- `apps/api-bff/src/app/app.module.ts` — registrar módulos e interceptor global.
- `apps/api-bff/package.json` — adicionar dependências.

## 3. Fora de escopo

- MongoDB real (stub em memória, Fase 4).
- Autenticação via OAuth/OIDC provider real (JWT secret via env, D-004).
- Telas, e2e, K8s (fases seguintes).

## 4. Dependências

- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` já instalados (Fase 1).
- `@nestjs/passport` precisa ser adicionado ao `api-bff/package.json` (estava só na raiz).
- `@types/passport-jwt` precisa ser instalado como devDependency.
- `@nexus/common` disponível via path alias.

## 5. Passos

1. ✅ Redigir este documento.
2. ✅ Criar JwtAuthGuard e RolesGuard.
3. ✅ Criar decorators @Public e @Roles.
4. ✅ Criar LoggingInterceptor.
5. ✅ Criar JwtAuthModule com JwtStrategy.
6. ✅ Criar AcordosModule (Controller, Service, Repository).
7. ✅ Registrar no AppModule.
8. ✅ Atualizar package.json.
9. ✅ Testes unitários.
10. ✅ Lint + test + build verdes; PROJECT.md atualizado.

## 6. Contratos SOLID aplicados

- **SRP**: Controller só faz roteamento/validação; Service só contém lógica de negócio; Repository só acessa dados.
- **OCP/DIP**: Service depende de `IAcordosRepository` (interface), não da implementação concreta — a troca para MongoDB na Fase 4 não exige alteração no Service.
- **LSP**: `InMemoryAcordosRepository` implementa `IAcordosRepository` completamente.
- **ISP**: interfaces segregadas por responsabilidade.

## 7. Segurança (OWASP)

- **A01 (Broken Access Control)**: `JwtAuthGuard` global + `@Public` explícito.
- **A04 (Insecure Design)**: `RolesGuard` aplica RBAC simples.
- **A09 (Logging/Monitoring)**: `LoggingInterceptor` loga método, rota, status e latência.

## 8. Definition of Done

- [x] Guards, decorators, interceptor e módulos implementados.
- [x] AcordosModule com CRUD mínimo (create, findAll, findOne, update, remove).
- [x] AppModule registra tudo corretamente.
- [x] Testes unitários passando.
- [x] `nx run-many -t lint test build` verde (4/4 projetos).
- [x] PROJECT.md atualizado.
- [x] Evidências registradas neste arquivo.

## 9. Evidências

> Execução dos quality gates em 2026-10-30.

### Lint (2026-10-30)

```
> nx run api-bff:lint

> eslint .

NX  Successfully ran target lint for project api-bff
```

### Testes (2026-10-30)

```
> nx run api-bff:test

> jest --passWithNoTests=true

PASS  api-bff  src/app/app.controller.spec.ts
PASS  api-bff  src/app/app.service.spec.ts
PASS  api-bff  src/acordos/acordos.service.spec.ts
PASS  api-bff  src/auth/guards/roles.guard.spec.ts
PASS  api-bff  src/common/interceptors/logging.interceptor.spec.ts

Test Suites: 5 passed, 5 total
Tests:       18 passed, 18 total
```

### Build (2026-10-30)

```
> nx run api-bff:build

> webpack-cli build

webpack compiled successfully

NX  Successfully ran target build for project api-bff and 1 task it depends on
```

### run-many lint+test+build (4 projetos, sem regressão)

```
NX  Running targets lint, test, build for 4 projects:
  - frontend-angular, ms-cobranca, api-bff, common

NX  Successfully ran targets lint, test, build for 4 projects
12/12 tarefas verdes — sem regressão.
```

### Correções aplicadas durante o fechamento

- `logging.interceptor.ts` usava tipos de `express`, que não é dependência direta do `api-bff`. Substituído por contratos estruturais mínimos (`HttpRequestLike`/`HttpResponseLike`), sem adicionar dependências.
- `acordos.service.spec.ts` importava `../interfaces/...` e `../acordos.service` a partir de `src/acordos/`; caminhos corrigidos para `./interfaces/...` e `./acordos.service`.
- Warnings de lint removidos: helper `buildContext` não utilizado em `roles.guard.spec.ts` e non-null assertion em `roles.guard.ts`.
