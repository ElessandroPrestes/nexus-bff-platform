# TASK-007 — Fase 7: Testes E2E no BFF e README Executivo

## Metadados

| Campo             | Valor                       |
| ----------------- | --------------------------- |
| ID                | TASK-007                    |
| SPEC              | SPEC-001 (seção 5 — Fase 7) |
| Autor             | Agente                      |
| Status            | **Concluída**               |
| Prioridade        | Alta                        |
| Depende de        | TASK-006 (concluída)        |
| Data de início    | 2026-10-31                  |
| Data de conclusão | 2026-11-01                  |

## 1. Descrição

Fechar o programa Nexus Core com os últimos entregáveis de qualidade e documentação:

- **Testes E2E do BFF** via Jest + Supertest: testa o servidor HTTP real do NestJS
  sem mock de módulos, cobrindo health check, CRUD de acordos e comportamento dos
  guards (401, 403, 422).
- **README.md executivo** na raiz do monorepo: substitui o README do framework
  Universal SDD por uma página orientada ao produto — o que é, como rodar, como
  testar, como contribuir.

## 2. Escopo

### Arquivos a criar

```
tasks/TASK-007-phase7-tests-docs.md   (este documento)
apps/api-bff/test/
  app.e2e-spec.ts                     # health check e raiz da API
  acordos.e2e-spec.ts                 # CRUD completo + guards
apps/api-bff/jest.config.e2e.cts      # configuração Jest para E2E
README.md                             # README executivo (substitui o atual)
```

### Arquivos a modificar

- `apps/api-bff/package.json` — adicionar `supertest` e `@types/supertest`.
- `apps/api-bff/project.json` — adicionar target `e2e`.
- `package.json` raiz — adicionar `supertest` e `@types/supertest` como devDependencies.
- `PROJECT.md` — estado canônico e histórico.

### Arquivos fora de escopo

- Testes unitários do Angular (já existem via Vitest; 25 passando).
- Pipeline Cypress/Playwright (não previsto na SPEC-001).
- Integração com banco real (usa `InMemoryAcordosRepository`).

## 3. Fora de escopo

- Testes E2E do `ms-cobranca` (requer RabbitMQ e MongoDB — infra não disponível no CI sem serviços).
- Testes visuais/e2e do frontend (fora da SPEC-001 Fase 7).
- Cobertura de código (não exigida pela SPEC-001).

## 4. Decisões

| Decisão | Justificativa |
| ------- | ------------- |
| Supertest sobre aplicação NestJS completa | Testa o pipeline real (guards, interceptors, pipes) sem mock; alinhado à SPEC-001 Fase 7. |
| JWT fixo em variável de ambiente de teste | Sem provedor real (D-004); `JWT_SECRET=test-secret` no setup do E2E. |
| `jest.config.e2e.cts` separado do unitário | Evita que testes E2E rodem no target `test` (que exige `--passWithNoTests`); mantém rastreabilidade. |
| Target `e2e` no `project.json` | Alinhado ao padrão Nx; permite `pnpm nx e2e api-bff`. |
| README executivo substitui README do framework | O framework tem sua própria doc em `UNIVERSAL_SDD_FRAMEWORK.md`; a raiz passa a orientar desenvolvedores e avaliadores do produto. |

## 5. Passos

1. ✅ Redigir este documento.
2. ✅ Instalar `supertest` e `@types/supertest` como devDependencies.
3. ✅ Criar testes E2E (`app.e2e-spec.ts` e `acordos.e2e-spec.ts`).
4. ✅ Configurar `jest.config.e2e.cts` e target `e2e` no `project.json`.
5. ✅ Criar `README.md` executivo.
6. ✅ Rodar lint + test + e2e + build; registrar evidências.
7. ✅ Atualizar este documento (DoD + Evidências) e `PROJECT.md`.

## 6. Definition of Done

- [x] `supertest` instalado como devDependency (package.json raiz).
- [x] `app.e2e-spec.ts` e `acordos.e2e-spec.ts` criados com cobertura dos fluxos críticos.
- [x] `jest.config.e2e.cts` configurado e target `e2e` funcional no Nx.
- [x] `pnpm nx e2e api-bff` executa e passa (18/18 testes).
- [x] `README.md` executivo publicado na raiz.
- [x] `nx run-many -t lint test build` verde (sem regressão).
- [x] Evidências registradas.
- [x] `PROJECT.md` atualizado.

## 7. Evidências

### Gates de qualidade (2026-11-01)

```
pnpm nx run-many -t lint --exclude=nexus-core
✔  nx run common:lint           [cache]
✔  nx run frontend-angular:lint [cache]
✔  nx run ms-cobranca:lint
✔  nx run api-bff:lint
NX   Successfully ran target lint for 4 projects
```

```
pnpm nx run-many -t test --exclude=nexus-core
✔  nx run common:test           [cache]
✔  nx run api-bff:test
✔  nx run ms-cobranca:test
✔  nx run frontend-angular:test
NX   Successfully ran target test for 4 projects
```

```
pnpm nx e2e api-bff
PASS api-bff-e2e apps/api-bff/test/app.e2e-spec.ts (16.465 s)
PASS api-bff-e2e apps/api-bff/test/acordos.e2e-spec.ts (16.843 s)
Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
NX   Successfully ran target e2e for project api-bff
```

```
pnpm nx run-many -t build --exclude=nexus-core
✔  nx run common:build          [cache]
✔  nx run frontend-angular:build:production
✔  nx run api-bff:build
✔  nx run ms-cobranca:build
NX   Successfully ran target build for 4 projects
```

### Decisão técnica registrada

`@nestjs/jwt@12` e `@nestjs/passport@12` são pacotes ESM puros (`"type": "module"`).
ts-jest 29 não transforma arquivos `.js` de pacotes ESM de node_modules por padrão.

Solução aplicada em `jest.config.e2e.cts`:
- `transform`: `babel-jest` com `@babel/preset-env` (`modules: 'commonjs'`) para arquivos `.js`
- `transformIgnorePatterns`: regex que exclui `@nestjs/passport` e `@nestjs/jwt` do bloqueio, compatível com estrutura pnpm (`.pnpm/<hash>/node_modules/<pkg>`)
- `resolver`: `@nx/jest/plugins/resolver` para resolução de path aliases (`@nexus/common`)
