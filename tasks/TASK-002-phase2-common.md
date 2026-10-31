# TASK-002 — Fase 2: Biblioteca Compartilhada (`libs/common`)

## Metadados

| Campo | Valor |
| --- | --- |
| ID | TASK-002 |
| SPEC | SPEC-001 (seção 5 — Fase 2) |
| Autor | Agente |
| Status | Concluída |
| Prioridade | Alta |
| Depende de | TASK-001 (concluída) |
| Data de início | 2026-10-29 |

## 1. Descrição

Implementar a biblioteca compartilhada `libs/common` (`@nexus/common`) com enums, interfaces tipadas e DTOs validados que serão consumidos tanto pelo BFF (`apps/api-bff`) quanto pelo worker (`apps/ms-cobranca`) e potencialmente pelo frontend (`apps/frontend-angular`).

A lib deve ser **agnóstica de transporte e framework**, ou seja: sem imports de NestJS, Express, Angular ou qualquer runtime de servidor no código-fonte (apenas `class-validator` e `class-transformer`, que são bibliotecas de validação/serialização puras).

## 2. Escopo

### Arquivos a criar

```
libs/common/src/lib/
├── enums/
│   ├── status-acordo.enum.ts
│   ├── tipo-pagamento.enum.ts
│   └── index.ts
├── interfaces/
│   ├── acordo.interface.ts
│   ├── paginated-result.interface.ts
│   ├── api-response.interface.ts
│   └── index.ts
└── dtos/
    ├── create-acordo.dto.ts
    ├── update-acordo.dto.ts
    ├── acordo-response.dto.ts
    └── index.ts
```

### Arquivos a modificar

- `libs/common/src/lib/common.ts` → remover (substituído pelos artefatos acima).
- `libs/common/src/lib/common.spec.ts` → atualizado com testes reais.
- `libs/common/src/index.ts` → re-exportar todos os artefatos.
- `libs/common/package.json` → adicionar `class-validator` e `class-transformer` como peerDependencies.

## 3. Fora de escopo

- Regras de negócio complexas de conciliação/faturamento.
- Integração com banco de dados ou mensageria.
- Imports de NestJS, Angular, Express ou qualquer runtime de transporte.
- Autenticação/autorização (Fase 3).

## 4. Dependências

- `class-validator` e `class-transformer` já instalados na Fase 1.
- SPEC-001 aprovada por Elessandro em 2026-10-29.

## 5. Passos

1. ✅ Redigir este documento.
2. ✅ Criar estrutura de pastas `dtos/`, `interfaces/`, `enums/`.
3. ✅ Implementar `StatusAcordo` e `TipoPagamento` (enums).
4. ✅ Implementar `IAcordo`, `IPaginatedResult<T>`, `IApiResponse<T>` (interfaces).
5. ✅ Implementar `CreateAcordoDto` com decorators `class-validator`.
6. ✅ Implementar `UpdateAcordoDto` (PartialType de `CreateAcordoDto`) e `AcordoResponseDto`.
7. ✅ Atualizar `index.ts` para re-exportar tudo.
8. ✅ Escrever testes unitários que cubram validações dos DTOs e enums.
9. ✅ `nx run-many -t lint test build` verde.
10. ✅ `PROJECT.md` atualizado.

## 6. Contratos definidos

### Enums

```typescript
enum StatusAcordo { PENDENTE, ATIVO, CONCLUIDO, CANCELADO, INADIMPLENTE }
enum TipoPagamento { BOLETO, PIX, CARTAO_CREDITO, CARTAO_DEBITO, TRANSFERENCIA }
```

### Interfaces

```typescript
interface IAcordo { id: string; descricao: string; valor: number; dataVencimento: Date;
  status: StatusAcordo; tipoPagamento: TipoPagamento; criadoEm: Date; atualizadoEm: Date; }

interface IPaginatedResult<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }

interface IApiResponse<T> { success: boolean; data?: T; message?: string; errors?: string[]; timestamp: string; }
```

### DTOs

- `CreateAcordoDto`: campos obrigatórios com validação (`@IsString`, `@IsNumber`, `@IsDateString`, `@IsEnum`).
- `UpdateAcordoDto`: todos os campos opcionais (via mapped type `PartialType`).
- `AcordoResponseDto`: campos de resposta incluindo `id`, `criadoEm`, `atualizadoEm`.

## 7. Testes

- Validação: instanciar DTOs com dados válidos e inválidos; verificar erros do `class-validator`.
- Enums: checar que todos os valores existem.
- Interfaces: verificar tipagem em tempo de compilação (type-check).

## 8. Definition of Done

- [x] Estrutura `dtos/`, `interfaces/`, `enums/` criada.
- [x] Enums `StatusAcordo` e `TipoPagamento` implementados.
- [x] Interfaces `IAcordo`, `IPaginatedResult<T>`, `IApiResponse<T>` implementadas.
- [x] `CreateAcordoDto` com validações `class-validator`.
- [x] `UpdateAcordoDto` e `AcordoResponseDto` implementados.
- [x] `index.ts` exportando todos os artefatos.
- [x] Testes passando (lint + test + build verdes).
- [x] `PROJECT.md` atualizado.
- [x] Evidências registradas neste arquivo.

## 9. Evidências

### Lint (2026-10-29)

```
NX  Running target lint for project common

> eslint .

NX  Successfully ran target lint for project common
```

### Testes (2026-10-29)

```
PASS  common  src/lib/common.spec.ts

  StatusAcordo
    ✓ deve conter todos os estados esperados
    ✓ deve ter exatamente 5 valores
  TipoPagamento
    ✓ deve conter todas as formas de pagamento esperadas
    ✓ deve ter exatamente 5 valores
  CreateAcordoDto
    ✓ deve passar com payload válido
    ✓ deve rejeitar descricao vazia
    ✓ deve rejeitar descricao com menos de 5 caracteres
    ✓ deve rejeitar descricao com mais de 500 caracteres
    ✓ deve rejeitar valorEmCentavos negativo
    ✓ deve rejeitar valorEmCentavos zero
    ✓ deve rejeitar valorEmCentavos decimal
    ✓ deve rejeitar dataVencimento inválida
    ✓ deve rejeitar status inválido
    ✓ deve rejeitar tipoPagamento inválido
    ✓ deve rejeitar numeroParcelas menor que 1
    ✓ deve rejeitar numeroParcelas maior que 360
    ✓ deve rejeitar devedorId vazio
    ✓ deve rejeitar credorId vazio
  UpdateAcordoDto
    ✓ deve passar com payload vazio (todos opcionais)
    ✓ deve validar campos quando fornecidos
    ✓ deve aceitar atualização parcial com apenas um campo válido
  AcordoResponseDto
    ✓ deve construir uma instância com todos os campos
  Interfaces (type-level)
    ✓ IAcordo deve aceitar objeto com todos os campos obrigatórios
    ✓ IPaginatedResult<T> deve aceitar resultado paginado genérico
    ✓ IApiResponse<T> deve aceitar envelope de sucesso
    ✓ IApiResponse<T> deve aceitar envelope de erro sem data

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
```

### Build (2026-10-29)

```
NX  Running target build for project common

Compiling TypeScript files for project "common"...
Done compiling TypeScript files for project "common".

NX  Successfully ran target build for project common
```

### run-many lint+test+build (4 projetos, sem regressão)

```
NX  Running targets lint, test, build for 4 projects:
  - frontend-angular, ms-cobranca, api-bff, common

✔  nx run common:test           [cache]
✔  nx run common:build          [cache]
✔  nx run common:lint           [cache]
✔  nx run ms-cobranca:test
✔  nx run api-bff:test
✔  nx run frontend-angular:build:production
✔  nx run frontend-angular:test
✔  nx run ms-cobranca:build
✔  nx run api-bff:build
✔  nx run api-bff:lint
✔  nx run ms-cobranca:lint
✔  nx run frontend-angular:lint

NX  Successfully ran targets lint, test, build for 4 projects
12/12 tarefas verdes — sem regressão.
```

### Decisão técnica registrada

`UpdateAcordoDto` implementado manualmente com `@IsOptional` em vez de usar `PartialType(@nestjs/mapped-types)`. Motivo: `@nestjs/mapped-types@12` distribui ESM puro, incompatível com o Jest CJS do monorepo sem configuração adicional de transformação que dependeria de paths hashed do pnpm virtual store. A implementação manual é mais robusta, mantém a lib agnóstica de framework e evita dependência não-essencial.

