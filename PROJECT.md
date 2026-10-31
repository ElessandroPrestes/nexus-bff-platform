# PROJECT.md — Estado Canônico

> Este arquivo registra o **estado canônico atual** do projeto. Ele é a fonte de verdade sobre o que o projeto é, o que já existe e o que está aprovado. Divergências entre este arquivo, a SPEC e o código são tratadas como defeito, mudança de escopo ou dívida documental.

## 1. Identidade

| Campo               | Valor                                                          |
| ------------------- | -------------------------------------------------------------- |
| Nome                | Nexus Core (Nexus BFF Platform)                                |
| Repositório         | `nexus-bff-platform`                                           |
| Tipo                | Monorepo full-stack: BFF, worker assíncrono e frontend Angular |
| Status              | TASK-003 (Fase 3) concluída — Fase 4 pendente                  |
| Versão do framework | Universal SDD pré-1.0                                          |
| Licença             | A definir                                                      |

## 2. Objetivo

Fornecer uma camada BFF que agrega, orquestra e adapta APIs de backend para consumo por aplicações frontend, com contratos explícitos, observabilidade e governança documental.

> **Pendente de discovery:** escopo funcional detalhado, domínios atendidos e consumidores ainda não foram aprovados. Não inventar requisitos — registrar em `specs/` após discovery.

## 3. Stack e Arquitetura

| Item              | Valor                                                                |
| ----------------- | -------------------------------------------------------------------- |
| Linguagem         | TypeScript 6                                                         |
| Monorepo          | Nx 24 + pnpm 9 (ADR-0001)                                            |
| Runtime           | Node.js 24                                                           |
| Frontend          | Angular 22 (standalone, signals)                                     |
| Backend/BFF       | NestJS 11                                                            |
| Worker            | NestJS 11 microservices (RabbitMQ)                                   |
| Persistência      | MongoDB 7                                                            |
| Cache             | Redis 7                                                              |
| Mensageria        | RabbitMQ 3                                                           |
| Servidor estático | Nginx 1.27                                                           |
| Observabilidade   | `LoggingInterceptor` estruturado (latência/auditoria) — implementado |

> Decisões em `adr/ADR-0001`, `ADR-0002` e `ADR-0003`.

## 4. Estrutura do Repositório

```
.
├── README.md
├── PROJECT.md
├── AGENTS.md
├── CLAUDE.md / GEMINI.md / COPILOT.md
├── UNIVERSAL_SDD_FRAMEWORK.md
├── .github/workflows/ci.yml     # CI: lint + test + build
├── apps/
│   ├── api-bff/                 # NestJS BFF (helmet, throttler, validation pipe)
│   ├── ms-cobranca/             # NestJS worker (RabbitMQ — Fase 4)
│   └── frontend-angular/        # Angular 22 standalone
├── libs/
│   └── common/                  # Contratos compartilhados (Fase 2)
├── agents/        # papéis e limites
├── workflows/     # fluxos oficiais
├── profiles/      # perfis de configuração por stack/contexto
├── knowledge/     # base de conhecimento do projeto
├── standards/     # UX/UI, design system, acessibilidade, testes, quality gates
├── templates/     # artefatos executáveis (SPEC, TASK, testes, review, ADR)
├── specs/         # especificações aprovadas
├── tasks/         # tarefas derivadas de SPECs
├── reviews/       # registros de design review e code review
├── adr/           # Architecture Decision Records
└── docs/          # documentação do framework e do projeto
```

## 5. Estado Atual

- [x] Framework Universal SDD instalado.
- [x] Documentação base criada.
- [x] Discovery de produto e UX (requisitos do Nexus Core fornecidos).
- [x] Arquitetura proposta em ADR-0001/0002/0003.
- [x] SPEC-001 (Nexus Core) redigida e aprovada (Elessandro, 2026-10-29).
- [x] TASK-001 (Fase 1) implementada e concluída.
  - [x] Monorepo Nx 24 + pnpm 9 inicializado.
  - [x] Projetos `api-bff`, `ms-cobranca`, `frontend-angular`, `common` criados.
  - [x] `helmet`, `ThrottlerModule`, `ValidationPipe` global configurados no BFF.
  - [x] Dependências de segurança/JWT instaladas.
  - [x] ESLint + Prettier configurados.
  - [x] `lint`, `test`, `build` verdes (4/4 projetos).
  - [x] CI básico criado (`.github/workflows/ci.yml`).
- [x] TASK-002 (Fase 2 — `libs/common`) implementada e concluída.
  - [x] Enums `StatusAcordo` (5 valores) e `TipoPagamento` (5 valores) criados.
  - [x] Interfaces `IAcordo`, `IPaginatedResult<T>`, `IApiResponse<T>` criadas.
  - [x] `CreateAcordoDto` com decorators `class-validator` (validação completa).
  - [x] `UpdateAcordoDto` com todos os campos opcionais (`@IsOptional`).
  - [x] `AcordoResponseDto` com shape de resposta + metadados do sistema.
  - [x] `@nexus/common` exporta tudo via `index.ts` (barrel).
  - [x] 26/26 testes unitários passando.
  - [x] `lint`, `test`, `build` verdes (4/4 projetos, sem regressão).
- [x] TASK-003 (Fase 3 — BFF SOLID) implementada e concluída.
  - [x] `JwtAuthGuard` global com bypass via `@Public()`.
  - [x] `RolesGuard` (RBAC) com decorator `@Roles()`.
  - [x] `JwtStrategy` (passport-jwt) e `JwtAuthModule`.
  - [x] `LoggingInterceptor` global (latência/auditoria, OWASP A09).
  - [x] `AcordosModule` com Controller enxuto, Service e `IAcordosRepository` (DIP).
  - [x] `InMemoryAcordosRepository` como stub (MongoDB na Fase 4).
  - [x] AppModule registra guards, interceptor e módulos.
  - [x] 18/18 testes unitários passando.
  - [x] `lint`, `test`, `build` verdes (4/4 projetos, sem regressão).
- [ ] TASK-004 (Fase 4 — ms-cobranca): pendente.
- [ ] TASK-005 (Fase 5 — Frontend Angular): pendente.
- [ ] TASK-006 (Fase 6 — Docker, K8s, CI/CD completo): pendente.
- [ ] TASK-007 (Fase 7 — Testes e Documentação): pendente.

## 6. Convenções

- Commits seguem o padrão definido em `CONTRIBUTING.md`.
- Branches: `main` (estável), `develop` (integração), `feature/*`, `fix/*`, `chore/*`.
- Toda mudança relevante referencia uma SPEC e/ou ADR.
- Scripts raiz usam `--exclude=nexus-core` para evitar loop recursivo no Nx.

## 7. Dívidas e Pendências Conhecidas

| ID    | Descrição                                                 | Impacto                          | Dono               |
| ----- | --------------------------------------------------------- | -------------------------------- | ------------------ |
| D-001 | Review formal da TASK-001 pendente                        | Baixo — pode ser feito na Fase 2 | Arquitetura        |
| D-002 | Schema de Acordo e regras de negócio pendentes            | Limita Fases 2–4                 | Produto            |
| D-003 | Licença não definida                                      | Bloqueia release público         | Mantenedores       |
| D-004 | Provedor JWT, registry de imagens e cluster K8s pendentes | Limita Fases 3 e 6               | Arquitetura/DevOps |
| D-005 | Warning de budget Angular no `nx-welcome.ts`              | Nenhum — componente scaffold     | Frontend (Fase 5)  |
| D-006 | Review formal de TASK-002 e TASK-003 pendente (gate G6)   | Baixo — não bloqueia Fase 4      | Arquitetura        |

## 8. Histórico de Atualizações

| Data       | Mudança                                                                          | Autor  |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| 2026-10-29 | Bootstrap do framework Universal SDD                                             | —      |
| 2026-10-29 | SPEC-001, ADR-0001/0002/0003 e TASK-001 redigidos                                | Agente |
| 2026-10-30 | TASK-001 (Fase 1) concluída: monorepo, segurança base, CI                        | Agente |
| 2026-10-29 | TASK-002 (Fase 2) concluída: enums, interfaces, DTOs, 26 testes                  | Agente |
| 2026-10-30 | TASK-003 (Fase 3) concluída: guards, RBAC, interceptor, AcordosModule, 18 testes | Agente |
