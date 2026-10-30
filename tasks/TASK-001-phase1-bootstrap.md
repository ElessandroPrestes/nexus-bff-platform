# TASK-001 — Fase 1: Bootstrap do Monorepo, Segurança & SOLID Base

## Metadados

| Campo | Valor |
| --- | --- |
| ID | TASK-001 |
| SPEC | SPEC-001 |
| Autor | Agente |
| Status | Concluída |
| Prioridade | Alta |
| Data de conclusão | 2026-10-30 |

## 1. Descrição

Inicializar o monorepo Nx + pnpm, criar os projetos `frontend-angular`, `api-bff`, `ms-cobranca` e `common`, instalar dependências de segurança/validação e configurar `helmet` + `ThrottlerModule` no BFF.

## 2. Escopo

- `package.json`, `nx.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`.
- `apps/api-bff`, `apps/frontend-angular`, `apps/ms-cobranca`, `libs/common`.
- `.eslintrc`/`eslint.config`, `.prettierrc`.
- `.env.example`.

## 3. Fora de escopo

- Regras de negócio, DTOs completos, telas, infra K8s (fases seguintes).

## 4. Dependências

- ADR-0001 (Nx) e ADR-0002 (versões) aprovados.

## 5. Passos

1. ✅ Inicializar Nx no repositório existente (sem sobrescrever docs).
2. ✅ Criar apps/libs com geradores Nx.
3. ✅ Instalar `helmet`, `@nestjs/throttler`, `class-validator`, `class-transformer`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`.
4. ✅ Configurar `main.ts` do BFF: helmet, throttler, validation pipe global.
5. ✅ Configurar ESLint + Prettier.
6. ✅ Validar `lint`, `test`, `build`.

## 6. Testes

- [x] `nx run-many -t lint --exclude=nexus-core` verde (4/4 projetos).
- [x] `nx run-many -t test --exclude=nexus-core` verde (7 testes passando).
- [x] `nx run-many -t build --exclude=nexus-core` verde (4/4 projetos).
- [ ] Smoke test do BFF respondendo (faz parte da Fase 3).

## 7. Evidências

### Lint (2026-10-30)

```
NX  Running target lint for 4 projects:
  - frontend-angular, ms-cobranca, api-bff, common

✔  nx run frontend-angular:lint  [cache]
✔  nx run api-bff:lint           [cache]
✔  nx run ms-cobranca:lint       [cache]
✔  nx run common:lint            [cache]

NX  Successfully ran target lint for 4 projects
```

### Testes (2026-10-30)

```
NX  Running target test for 4 projects:

api-bff:       2 testes passando (app.controller.spec, app.service.spec)
ms-cobranca:   2 testes passando (app.controller.spec, app.service.spec)
frontend-angular: 1 teste passando (app.spec)
common:        1 teste passando (common.spec)

NX  Successfully ran target test for 4 projects
Total: 7 testes, 0 falhas
```

### Build (2026-10-30)

```
NX  Running target build for 4 projects:

api-bff:          webpack compiled successfully
ms-cobranca:      webpack compiled successfully
frontend-angular: Application bundle generation complete
common:           TypeScript compiled successfully

NX  Successfully ran target build for 4 projects

Nota: warning de budget no nx-welcome.ts do Angular (componente gerado pelo Nx)
— não bloqueia build, escopo da Fase 5.
```

### Segurança no BFF (apps/api-bff/src/main.ts + app.module.ts)

- `helmet()` aplicado globalmente.
- `ThrottlerModule` configurado (100 req/60s) com `ThrottlerGuard` como `APP_GUARD`.
- `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- CORS com origem configurável via `CORS_ORIGIN` env var.

### CI/CD (2026-10-30)

- `.github/workflows/ci.yml` criado com jobs: lint, test, build.
- Node.js 24, pnpm 9, `--frozen-lockfile`, `cancel-in-progress`.

## 8. Definition of Done

- [x] Estrutura criada e buildável.
- [x] Segurança base configurada (helmet, throttler, validation pipe).
- [x] Lint/format configurados (ESLint + Prettier).
- [x] `PROJECT.md` atualizado.
- [x] CI básico criado (`.github/workflows/ci.yml`).
- [ ] Review formal concluído (pendente — pode ser feito na Fase 2).
