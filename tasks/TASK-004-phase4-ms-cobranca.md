# TASK-004 — Fase 4: Microsserviço de Cobrança (RabbitMQ + MongoDB)

## Metadados

| Campo          | Valor                       |
| -------------- | --------------------------- |
| ID             | TASK-004                    |
| SPEC           | SPEC-001 (seção 5 — Fase 4) |
| Autor          | Agente                      |
| Status         | Concluída                   |
| Prioridade     | Alta                        |
| Depende de     | TASK-003 (concluída)        |
| Data de início | 2026-10-31                  |

## 1. Descrição

Implementar o worker `apps/ms-cobranca` como consumidor assíncrono de eventos de
cobrança via RabbitMQ, com persistência MongoDB desacoplada, idempotência e retry.

- **Listener RabbitMQ** (`@nestjs/microservices`, transporte RMQ) para o padrão
  `cobranca.acordo.processar` na fila `cobranca.acordos`.
- **Repositório desacoplado** (`ICobrancaRepository`) com implementação
  `MongoCobrancaRepository` (Mongoose) e chave de idempotência `eventoId`.
- **Idempotência** por `eventoId`: eventos repetidos retornam o registro já
  persistido, sem duplicar dados.
- **Retry** com backoff exponencial no processamento; ao esgotar, a mensagem é
  rejeitada sem requeue (dead-letter).
- **Validação** do payload via `ValidationPipe` global (`whitelist`,
  `forbidNonWhitelisted`, `transform`).

## 2. Escopo

### Arquivos a criar

```
libs/common/src/lib/dtos/cobranca-evento.dto.ts
libs/common/src/lib/constants/cobranca.constants.ts

apps/ms-cobranca/src/cobranca/
├── interfaces/
│   └── cobranca-repository.interface.ts
├── schemas/
│   └── cobranca-acordo.schema.ts
├── repositories/
│   └── mongo-cobranca.repository.ts
├── cobranca.controller.ts
├── cobranca.service.ts
└── cobranca.module.ts
```

### Arquivos a modificar

- `libs/common/src/index.ts` — exportar DTO e constantes de cobrança.
- `apps/ms-cobranca/src/app/app.module.ts` — conectar MongoDB e registrar `CobrancaModule`.
- `apps/ms-cobranca/src/main.ts` — app híbrido HTTP (health) + microservice RMQ.
- `apps/ms-cobranca/package.json` — dependências do worker.
- `.env.example` — porta do worker e opções de retry.
- `PROJECT.md` — estado canônico após conclusão.

## 3. Fora de escopo

- Publicação de eventos no BFF (produtor será ligado quando o fluxo de criação
  disparar cobrança; nesta fase o worker apenas consome).
- Provedores de pagamento reais.
- Regras de negócio de conciliação/faturamento além do contrato de Acordo.
- Docker/K8s do worker (Fase 6).

## 4. Dependências

| Dependência               | Justificativa                                             |
| ------------------------- | --------------------------------------------------------- |
| `@nestjs/microservices`   | Listener RabbitMQ exigido pela SPEC-001 (Fase 4).         |
| `amqplib`                 | Driver AMQP usado pelo transporte RMQ do Nest.            |
| `amqp-connection-manager` | Reconexão gerenciada exigida pelo transporte RMQ do Nest. |
| `@nestjs/mongoose`        | Integração Mongoose idiomática com o DI do Nest.          |
| `mongoose`                | Persistência MongoDB exigida pela SPEC-001 (Fase 4).      |
| `@types/amqplib` (dev)    | Tipos TypeScript para `amqplib`.                          |

Todas as dependências derivam diretamente do escopo já aprovado na SPEC-001
(Fase 4) e em ADR-0002 (stack). Nenhuma dependência fora desse escopo foi adicionada.

## 5. Passos

1. ✅ Redigir este documento.
2. ✅ Criar contrato `CobrancaEventoDto` e constantes em `@nexus/common`.
3. ✅ Criar interface `ICobrancaRepository` e schema Mongoose.
4. ✅ Implementar `MongoCobrancaRepository` (idempotência por `eventoId`).
5. ✅ Implementar `CobrancaService` (retry com backoff).
6. ✅ Implementar `CobrancaController` (ack/nack manual no `RmqContext`).
7. ✅ Registrar `CobrancaModule` e conectar MongoDB no `AppModule`.
8. ✅ Configurar app híbrido (HTTP + RMQ) em `main.ts`.
9. ✅ Testes unitários (service, repository, controller).
10. ✅ Lint + test + build verdes; `PROJECT.md` atualizado.

## 6. Contratos e decisões

- **Mensagem**: `CobrancaEventoDto { eventoId, ocorridoEm, acordo: CreateAcordoDto }`.
- **Fila**: `cobranca.acordos`; padrão: `cobranca.acordo.processar`.
- **Idempotência**: índice único em `eventoId`; violação de chave duplicada
  (código 11000) é tratada como sucesso idempotente.
- **Ack/Nack**: `noAck: false`; ack só após persistência; falha definitiva gera
  `nack(requeue=false)` → dead-letter.
- **Retry**: 3 tentativas com backoff exponencial (base 200 ms), configurável por
  `COBRANCA_RETRY_ATTEMPTS` e `COBRANCA_RETRY_BASE_DELAY_MS`.

## 7. Definition of Done

- [x] `CobrancaEventoDto` compartilhado e validável.
- [x] Worker consome RabbitMQ e persiste em MongoDB via repositório desacoplado.
- [x] Idempotência verificada por teste.
- [x] Retry verificado por teste.
- [x] Testes unitários passando.
- [x] `nx run-many -t lint test build` verde (sem regressão).
- [x] `PROJECT.md` atualizado.
- [x] Evidências registradas neste arquivo.

## 8. Evidências

> Execução dos quality gates em 2026-10-31.

### Testes — common + ms-cobranca (2026-10-31)

```
> nx run common:test

Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total

> nx run ms-cobranca:test

PASS  ms-cobranca  src/cobranca/cobranca.controller.spec.ts
PASS  ms-cobranca  src/cobranca/cobranca.service.spec.ts
PASS  ms-cobranca  src/cobranca/repositories/mongo-cobranca.repository.spec.ts
PASS  ms-cobranca  src/app/app.controller.spec.ts
PASS  ms-cobranca  src/app/app.service.spec.ts

Test Suites: 5 passed, 5 total
Tests:       14 passed, 14 total
```

### Lint + Build (2026-10-31)

```
> nx run common:lint   → eslint . (sem erros)
> nx run common:build  → tsc (sucesso)
> nx run ms-cobranca:lint   → eslint . (sem erros)
> nx run ms-cobranca:build  → webpack compiled successfully

NX  Successfully ran targets lint, build for 2 projects
```

### run-many lint+test+build (2026-10-31)

```
NX  Running targets lint, test, build for 5 projects
NX  Successfully ran targets lint, test, build for 5 projects
```

Sem regressão nos projetos existentes (`api-bff`, `frontend-angular`, `common`).
O warning de budget do `nx-welcome.ts` permanece conhecido (D-005).

### Correções aplicadas durante o fechamento

- Adicionado `setupFiles: ['reflect-metadata']` nos Jest configs de `common` e
  `ms-cobranca`: os decorators de `class-transformer` (`@Type`) exigem
  `Reflect.getMetadata` antes da carga dos DTOs nos testes.
- Tipagem de `buildDocumento` no spec do repositório ampliada para aceitar `_id`,
  refletindo o documento Mongoose real.
