# TASK-008 — Migração da Persistência do BFF para MongoDB

## Metadados

| Campo          | Valor                    |
| -------------- | ------------------------ |
| ID             | TASK-008                 |
| SPEC           | SPEC-002                 |
| Autor          | Agente                   |
| Status         | **Concluída**            |
| Prioridade     | Alta                     |
| Depende de     | TASK-007 (concluída)     |
| Data de início | 2026-11-01               |

## 1. Descrição

Substituir o `InMemoryAcordosRepository` do BFF por `MongoAcordosRepository`,
conectando o `apps/api-bff` ao MongoDB 7 via `@nestjs/mongoose`.
A arquitetura DIP garante que `AcordosService` e `AcordosController` não precisam
ser alterados — apenas o provedor do módulo muda.

## 2. Escopo

### Arquivos a criar

```
apps/api-bff/src/acordos/schemas/
  acordo.schema.ts

apps/api-bff/src/acordos/repositories/
  mongo-acordos.repository.ts
  mongo-acordos.repository.spec.ts
```

### Arquivos a modificar

```
apps/api-bff/src/acordos/acordos.module.ts
apps/api-bff/src/app/app.module.ts
.env.example
docker-compose.yml
tasks/TASK-008-bff-mongodb.md  (este arquivo — DoD + Evidências ao final)
PROJECT.md
```

### Arquivos fora de escopo

- `in-memory-acordos.repository.ts` — mantido (usado nos E2E).
- `acordos.service.ts`, `acordos.controller.ts` — sem alteração.
- `apps/ms-cobranca/` — sem alteração.
- `libs/common/` — sem alteração.

## 3. Fora de escopo

- Paginação da listagem.
- Transações MongoDB.
- Indexação avançada.
- Migração de dados.

## 4. Dependências

- `@nestjs/mongoose` e `mongoose` já instalados (usados pelo `ms-cobranca`).
- MongoDB 7 já provisionado no Docker Compose e K8s.

## 5. Passos

1. ✅ Redigir SPEC-002.
2. ✅ Registrar aprovação da SPEC-002.
3. ✅ Redigir esta TASK.
4. ✅ Criar `acordo.schema.ts` com `@Schema({ collection: 'bff_acordos' })`.
5. ✅ Criar `mongo-acordos.repository.ts` implementando `IAcordosRepository`.
6. ✅ Criar `mongo-acordos.repository.spec.ts` com Model mockado.
7. ✅ Atualizar `acordos.module.ts`: `MongooseModule.forFeature` + troca de provedor.
8. ✅ Atualizar `app.module.ts` do BFF: `MongooseModule.forRoot`.
9. ✅ Atualizar `.env.example` e `docker-compose.yml` com `MONGODB_URI`.
10. ✅ Rodar lint + test + e2e + build; registrar evidências.
11. ✅ Atualizar este documento (DoD + Evidências) e `PROJECT.md`.

## 6. Testes

- [x] `mongo-acordos.repository.spec.ts`: cobertura de `create`, `findAll`, `findOne`, `update`, `remove`.
- [x] `findOne` com id inexistente retorna `null`.
- [x] `update` com id inexistente retorna `null`.
- [x] `remove` com id inexistente retorna `false`.
- [x] `nx run-many -t test` verde (28 testes unitários no api-bff, sem regressão).

## 7. Definition of Done

- [x] `acordo.schema.ts` criado com coleção `bff_acordos`.
- [x] `mongo-acordos.repository.ts` implementa todos os métodos de `IAcordosRepository`.
- [x] Testes unitários do repositório passam com Model mockado (9 testes).
- [x] `AcordosModule` usa `MongoAcordosRepository` como provedor.
- [x] `AppModule` do BFF inicializa `MongooseModule.forRoot`.
- [x] `.env.example` e `docker-compose.yml` atualizados com `MONGODB_URI`.
- [x] `pnpm nx run-many -t lint test build` verde (sem regressão).
- [x] Testes E2E continuam passando (18/18) com override InMemory.
- [x] `PROJECT.md` atualizado.
- [x] D-008 marcado como resolvido no `PROJECT.md`.

## 8. Evidências

### Gates de qualidade (2026-11-01)

```
pnpm nx run-many -t lint --exclude=nexus-core
✔  nx run common:lint           [cache]
✔  nx run frontend-angular:lint [cache]
✔  nx run ms-cobranca:lint      [cache]
✔  nx run api-bff:lint
NX   Successfully ran target lint for 4 projects
```

```
pnpm nx run-many -t test --exclude=nexus-core
✔  nx run common:test           [cache]
✔  nx run frontend-angular:test [cache]
✔  nx run ms-cobranca:test      [cache]
✔  nx run api-bff:test          (28 testes: +9 MongoAcordosRepository, +1 reflect-metadata fix)
NX   Successfully ran target test for 4 projects
```

```
pnpm nx e2e api-bff
PASS api-bff-e2e test/acordos.e2e-spec.ts (15.5s)
PASS api-bff-e2e test/app.e2e-spec.ts    (15.6s)
Test Suites: 2 passed — Tests: 18 passed
NX   Successfully ran target e2e for project api-bff
```

```
pnpm nx run-many -t build --exclude=nexus-core
✔  nx run common:build          [cache]
✔  nx run ms-cobranca:build     [cache]
✔  nx run frontend-angular:build:production [cache]
✔  nx run api-bff:build
NX   Successfully ran target build for 4 projects
```

### Nota técnica

`jest.config.cts` do `api-bff` não tinha `setupFiles: ['reflect-metadata']`,
diferente do `ms-cobranca`. A omissão não causava problema antes porque nenhum
spec do BFF importava de `@nexus/common` por caminhos que ativassem `@Type()`.
O novo spec usa `UpdateAcordoDto` e `CreateAcordoDto` que disparam decoradores
do `class-transformer`, exigindo o `reflect-metadata` no setup.
Corrigido adicionando `setupFiles: ['reflect-metadata']` ao `jest.config.cts`.
