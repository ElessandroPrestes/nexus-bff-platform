# SPEC-002 — Migração da Persistência do BFF para MongoDB

## Metadados

| Campo       | Valor                                      |
| ----------- | ------------------------------------------ |
| ID          | SPEC-002                                   |
| Autor       | Agente (Spec Author)                       |
| Status      | Aprovada                                   |
| Data        | 2026-11-01                                 |
| Aprovação   | Elessandro em 2026-11-01                   |
| Relacionados| SPEC-001 (Fase 3 e 4), D-008, TASK-008, ADR-0002 |

## 1. Contexto

O `apps/api-bff` foi entregue na Fase 3 da SPEC-001 com `InMemoryAcordosRepository`
como stub de persistência. O design já previa a substituição por MongoDB via DIP
(a dívida D-008 registra isso formalmente).

O `apps/ms-cobranca` já usa `@nestjs/mongoose` + Mongoose com sucesso — schema,
repositório, módulo e conexão estão todos estabelecidos como referência.
O Docker Compose e os manifestos K8s já provisionam o MongoDB 7. O BFF só precisa
conectar-se a ele e trocar o provedor do repositório.

## 2. Objetivo

Substituir o `InMemoryAcordosRepository` do BFF por um `MongoAcordosRepository`
que persista acordos na coleção `bff_acordos` do MongoDB, tornando os dados
duráveis entre reinicializações do container.

## 3. Escopo

### Arquivos a criar

```
apps/api-bff/src/acordos/schemas/
  acordo.schema.ts                        # Schema Mongoose para Acordo

apps/api-bff/src/acordos/repositories/
  mongo-acordos.repository.ts             # Implementação MongoDB de IAcordosRepository
  mongo-acordos.repository.spec.ts        # Teste unitário com mock do Model
```

### Arquivos a modificar

```
apps/api-bff/src/acordos/acordos.module.ts   # Adiciona MongooseModule.forFeature + troca provedor
apps/api-bff/src/app/app.module.ts           # Adiciona MongooseModule.forRoot
.env.example                                 # Adiciona MONGODB_URI
docker-compose.yml                           # Adiciona MONGODB_URI ao serviço api-bff
```

### Arquivos fora de escopo

- `apps/api-bff/src/acordos/repositories/in-memory-acordos.repository.ts` — mantido para testes E2E.
- `apps/api-bff/src/acordos/acordos.service.ts` — sem alteração (DIP garante isso).
- `apps/api-bff/src/acordos/acordos.controller.ts` — sem alteração.
- `apps/ms-cobranca/` — sem alteração.
- `libs/common/` — sem alteração.

## 4. Não-objetivos

- Migração de dados existentes (InMemory não persiste nada para migrar).
- Transações MongoDB (além do escopo desta SPEC).
- Indexação avançada ou TTL (pode ser SPEC futura).
- Paginação da listagem de acordos (pode ser SPEC futura).
- Compartilhamento de coleção com `ms-cobranca` (coleções distintas por responsabilidade).

## 5. Comportamento esperado

### Schema (`AcordoDocument`)

- Coleção: `bff_acordos` (distinta de `acordos` usada pelo worker).
- Campos mapeados 1-para-1 com `AcordoResponseDto`:
  `descricao`, `valorEmCentavos`, `dataVencimento`, `status`, `tipoPagamento`,
  `numeroParcelas`, `devedorId`, `credorId`, `criadoEm`, `atualizadoEm`.
- `_id` do MongoDB é exposto como `id` (string) no DTO de resposta.
- `versionKey: false` (sem campo `__v`).

### `MongoAcordosRepository`

Implementa `IAcordosRepository` com comportamento idêntico ao `InMemoryAcordosRepository`,
usando `Model<AcordoDocument>` injetado via `@InjectModel`:

| Método     | Comportamento MongoDB                                    |
| ---------- | -------------------------------------------------------- |
| `create`   | `model.create(dados)` com timestamps gerados na camada  |
| `findAll`  | `model.find().lean().exec()`                             |
| `findOne`  | `model.findById(id).lean().exec()` — retorna `null` se não encontrar |
| `update`   | `model.findByIdAndUpdate(id, dados, { new: true }).lean().exec()` |
| `remove`   | `model.findByIdAndDelete(id).lean().exec()` — retorna `true` se deletou |

### `AcordosModule`

- Importa `MongooseModule.forFeature([{ name: AcordoDocument.name, schema: AcordoSchema }])`.
- Troca o provedor `IAcordosRepository` de `InMemoryAcordosRepository` para `MongoAcordosRepository`.

### `AppModule` do BFF

- Importa `MongooseModule.forRoot(MONGODB_URI)` com `serverSelectionTimeoutMS` configurável.
- `MONGODB_URI` lido de `process.env.MONGODB_URI` com fallback `mongodb://localhost:27017/nexus`.

### Variáveis de ambiente

| Variável                               | Valor padrão                           |
| -------------------------------------- | -------------------------------------- |
| `MONGODB_URI`                          | `mongodb://localhost:27017/nexus`      |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS`  | `5000`                                 |

## 6. Critérios de aceite

- [ ] `MongoAcordosRepository.create` persiste o documento e retorna `AcordoResponseDto` com `id` preenchido.
- [ ] `MongoAcordosRepository.findAll` retorna lista de documentos da coleção.
- [ ] `MongoAcordosRepository.findOne` retorna o documento correto por `id`; retorna `null` para id inexistente.
- [ ] `MongoAcordosRepository.update` atualiza campos e retorna documento atualizado; retorna `null` para id inexistente.
- [ ] `MongoAcordosRepository.remove` remove o documento e retorna `true`; retorna `false` para id inexistente.
- [ ] `AcordosModule` registra `MongoAcordosRepository` como provedor de `IAcordosRepository`.
- [ ] `AppModule` do BFF inicializa `MongooseModule.forRoot` com `MONGODB_URI`.
- [ ] Testes unitários do `MongoAcordosRepository` passam com Model mockado.
- [ ] `pnpm nx run-many -t lint test build` verde (sem regressão nos 105 testes existentes).
- [ ] Testes E2E continuam passando (usam `InMemoryAcordosRepository` via override no `AppModule` de teste — não requerem MongoDB real).

## 7. Interfaces e dados

### `AcordoDocument` (Mongoose schema)

```typescript
@Schema({ collection: 'bff_acordos', versionKey: false })
export class AcordoDocument {
  descricao: string;
  valorEmCentavos: number;
  dataVencimento: string;
  status: string;
  tipoPagamento: string;
  numeroParcelas: number;
  devedorId: string;
  credorId: string;
  criadoEm: string;
  atualizadoEm: string;
}
```

### `IAcordosRepository` (sem alteração)

```typescript
abstract create(dto: CreateAcordoDto): Promise<AcordoResponseDto>;
abstract findAll(): Promise<AcordoResponseDto[]>;
abstract findOne(id: string): Promise<AcordoResponseDto | null>;
abstract update(id: string, dto: UpdateAcordoDto): Promise<AcordoResponseDto | null>;
abstract remove(id: string): Promise<boolean>;
```

## 8. Requisitos não-funcionais

- **Durabilidade**: dados persistem entre reinicializações do container.
- **Isolamento de coleção**: `bff_acordos` ≠ `acordos` (worker) — sem acoplamento entre serviços via banco.
- **Testabilidade**: `MongoAcordosRepository` testável sem MongoDB real (Model injetado e mockável).
- **Observabilidade**: erros de conexão propagados pelo NestJS logger existente.
- **Segurança**: `MONGODB_URI` nunca commitado — apenas em `.env` (gitignored) ou secrets.

## 9. Riscos

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
| MongoDB indisponível na inicialização | BFF falha ao subir | `serverSelectionTimeoutMS` configurável; Compose com healthcheck já existente |
| Testes E2E precisam de MongoDB real | Quebraria CI | E2E usa `InMemoryAcordosRepository` diretamente — sem alteração necessária |
| Conflito de coleção com worker | Dados misturados | Coleção `bff_acordos` é distinta de `acordos` (worker) |

## 10. Perguntas abertas

_Nenhuma — escopo fechado para esta SPEC._

## 11. Aprovação

| Nome        | Papel   | Data       | Decisão  |
| ----------- | ------- | ---------- | -------- |
| Elessandro  | Product Owner / Tech Lead | 2026-11-01 | Aprovado |
