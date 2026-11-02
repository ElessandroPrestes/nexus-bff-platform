# PROJECT.md — Estado Canônico

> Este arquivo registra o **estado canônico atual** do projeto. Ele é a fonte de verdade sobre o que o projeto é, o que já existe e o que está aprovado. Divergências entre este arquivo, a SPEC e o código são tratadas como defeito, mudança de escopo ou dívida documental.

## 1. Identidade

| Campo               | Valor                                                          |
| ------------------- | -------------------------------------------------------------- |
| Nome                | Nexus Core (Nexus BFF Platform)                                |
| Repositório         | `nexus-bff-platform`                                           |
| Tipo                | Monorepo full-stack: BFF, worker assíncrono e frontend Angular |
| Status              | TASK-011 concluída — redesign premium do frontend (P0 + P1) |
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
| Estilo frontend   | Tailwind CSS v4 (via `@tailwindcss/postcss`)                         |
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
│   ├── ms-cobranca/             # NestJS worker (RabbitMQ + MongoDB)
│   └── frontend-angular/        # Angular 22 standalone (signals, lazy, a11y)
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
- [x] TASK-004 (Fase 4 — ms-cobranca) implementada e concluída.
  - [x] Listener RabbitMQ (`@nestjs/microservices`, transporte RMQ) na fila `cobranca.acordos`.
  - [x] `CobrancaEventoDto` e constantes do contrato assíncrono em `@nexus/common`.
  - [x] `ICobrancaRepository` (DIP) + `MongoCobrancaRepository` (Mongoose).
  - [x] Idempotência por `eventoId` com índice único e tratamento de chave duplicada.
  - [x] Retry com backoff exponencial e dead-letter em falha definitiva.
  - [x] App híbrido: consumidor RMQ + health HTTP (`/api`).
  - [x] 14/14 testes do worker + 30/30 testes de `common` passando.
  - [x] `lint`, `test`, `build` verdes (5/5 projetos, sem regressão).
- [x] TASK-005 (Fase 5 — Frontend Angular) implementada e concluída.
  - [x] Componentes standalone, rotas lazy e Signals + RxJS.
  - [x] `authInterceptor` (Bearer JWT) e `errorInterceptor` global.
  - [x] Tema claro/escuro persistido e layout responsivo.
  - [x] Fluxos de login, listagem e criação de Acordo com estados vazio/carregando/erro/sucesso.
  - [x] Acessibilidade: skip link, foco visível, labels, `aria-live`, contraste AA, reduced motion.
  - [x] 25/25 testes do frontend passando.
  - [x] `lint`, `test`, `build` verdes (sem regressão); D-005 resolvido.
- [x] TASK-006 (Fase 6 — Docker, K8s, CI/CD completo): concluída.
  - [x] Dockerfiles multi-stage: `api-bff`, `ms-cobranca` e `frontend-angular` (Nginx unprivileged).
  - [x] `docker-compose.yml` com MongoDB, Redis, RabbitMQ, BFF, worker e frontend; healthchecks e dependências.
  - [x] Manifestos K8s: Namespace, ConfigMap, Secret, Deployments (probes, resources, securityContext), Services, Ingress, HPA, Kustomization.
  - [x] CI atualizado: jobs `imagens` (build + push GHCR) e `manifestos` (kubeconform + compose config).
  - [x] `docs/infra.md` com guias de operação local e K8s.
  - [x] Gates: `docker compose config` ✅, kubeconform 13/13 válidos ✅, lint/test/build 4/4 ✅ (87 testes).
- [x] TASK-007 (Fase 7 — Testes e Documentação): concluída.
  - [x] Testes E2E via Supertest: 18/18 passando (`app.e2e-spec.ts`, `acordos.e2e-spec.ts`).
  - [x] `jest.config.e2e.cts` + target `e2e` no Nx (`pnpm nx e2e api-bff`).
  - [x] `README.md` executivo na raiz do monorepo.
  - [x] Gates finais: lint/test/e2e/build 4/4 projetos ✅ (87 testes unitários + 18 E2E = 105 total).
- [x] TASK-008 (D-008 — Migração BFF para MongoDB): concluída.
  - [x] `AcordoDocument` schema Mongoose — coleção `bff_acordos`.
  - [x] `MongoAcordosRepository` implementando `IAcordosRepository` (DIP mantido).
  - [x] `AcordosModule` e `AppModule` do BFF conectados ao MongoDB via `MONGODB_URI`.
  - [x] `docker-compose.yml` atualizado: `api-bff` recebe `MONGODB_URI` e `depends_on: mongo`.
  - [x] `jest.config.cts` corrigido com `setupFiles: ['reflect-metadata']`.
  - [x] Gates: lint/test(28)/e2e(18)/build 4/4 ✅. D-008 resolvido.
- [x] TASK-009 (D-009 — Tailwind CSS + redesign UX/UI): concluída.
  - [x] Tailwind CSS v4 integrado via `@tailwindcss/postcss` + `.postcssrc.json`.
  - [x] Tokens semânticos (brand/surface/bg/text/muted/border/danger/success) com dark mode via `[data-theme='dark']`.
  - [x] Shell, login, lista, formulário, notificações e 404 redesenhados com utilitários Tailwind.
  - [x] Acessibilidade AA mantida (skip link, aria, foco visível, reduced motion).
  - [x] Gates: lint/test(25)/build 4/4 ✅. D-009 resolvido.
- [x] TASK-010 (CSP do frontend): concluída.
  - [x] `optimization.styles.inlineCritical = false` no build de produção.
  - [x] `index.html` gerado sem scripts inline; CSP `script-src 'self'` mantida.
  - [x] Verificação de regressão de scripts inline adicionada ao CI.
  - [x] Imagem `frontend` reconstruída e container `healthy`; UI renderiza com estilos.
  - [x] Gates: lint/test/build 4/4 ✅. Review em REV-001 (validação humana em D-012).
- [x] TASK-011 (SPEC-005 — redesign premium P0+P1): concluída.
  - [x] Componentes de UI reutilizáveis: `modal`, `drawer`, `skeleton`, `status-badge`, `kpi-card`, `currency-input`.
  - [x] App shell com sidebar/topbar, busca global, tema e drawer mobile.
  - [x] Dashboard `/dashboard` com 4 KPIs calculados da listagem e empty state.
  - [x] Listagem com toolbar (busca/filtro/ordenação), paginação client-side, menu de ações e drawer de detalhe.
  - [x] Remoção via modal acessível (focus trap, Escape, restauração de foco).
  - [x] Formulário em seções, máscara BRL, labels humanos e barra de ações sticky.
  - [x] Login split-screen com token monoespaçado, “Colar”, visibilidade e loading.
  - [x] Toasts com ícone/progresso, skeletons e empty states.
  - [x] Gates: lint/test(51)/build 4/4 ✅. Review em REV-002 (validação humana em D-013).

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
| D-004 | Provedor JWT, registry de imagens e cluster K8s pendentes | Fase 6 entregue com GHCR provisório; cluster K8s e registry definitivos ainda abertos | Arquitetura/DevOps |
| D-005 | Warning de budget Angular no `nx-welcome.ts`              | Resolvido em TASK-005 (scaffold removido) | Frontend   |
| D-006 | Review formal de TASK-002 e TASK-003 pendente (gate G6)   | Baixo — não bloqueia Fase 4      | Arquitetura        |
| D-007 | Review formal de TASK-004 pendente (gate G6)              | Baixo — não bloqueia Fase 5      | Arquitetura        |
| D-008 | ~~BFF ainda usa `InMemoryAcordosRepository`~~ — **Resolvido em TASK-008** | Resolvido | Produto/Arquitetura |
| D-009 | ~~Design de UX não aprovado (G2); Fase 5 entregue com UI e tokens provisórios~~ — **Resolvido em TASK-009** | Resolvido | Produto/UX |
| D-010 | Review formal de TASK-005 pendente (gate G6)              | Baixo — não bloqueia Fase 6      | Arquitetura        |
| D-011 | Review formal de TASK-006 pendente (gate G6)              | Baixo — não bloqueia Fase 7      | Arquitetura        |
| D-012 | Review formal de TASK-010 pendente (gate G6)              | Baixo — correção validada em auto-revisão (REV-001) | Arquitetura |
| D-013 | Review formal de TASK-011 pendente (gate G6)              | Baixo — redesign validado em auto-revisão (REV-002) | Arquitetura |

## 8. Histórico de Atualizações

| Data       | Mudança                                                                          | Autor  |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| 2026-10-29 | Bootstrap do framework Universal SDD                                             | —      |
| 2026-10-29 | SPEC-001, ADR-0001/0002/0003 e TASK-001 redigidos                                | Agente |
| 2026-10-30 | TASK-001 (Fase 1) concluída: monorepo, segurança base, CI                        | Agente |
| 2026-10-29 | TASK-002 (Fase 2) concluída: enums, interfaces, DTOs, 26 testes                  | Agente |
| 2026-10-30 | TASK-003 (Fase 3) concluída: guards, RBAC, interceptor, AcordosModule, 18 testes | Agente |
| 2026-10-31 | TASK-004 (Fase 4) concluída: worker RMQ, Mongo, idempotência, retry, 14 testes | Agente |
| 2026-10-31 | TASK-005 (Fase 5) concluída: SPA Angular, JWT, tema, a11y, 25 testes; exceção G2 registrada | Agente |
| 2026-10-31 | TASK-006 (Fase 6) concluída: Dockerfiles, Compose, K8s, CI/CD; gates Compose+kubeconform+lint/test/build ✅ | Agente |
| 2026-11-01 | TASK-007 (Fase 7) concluída: testes E2E 18/18, README executivo, gates lint/test/e2e/build ✅ | Agente |
| 2026-11-01 | TASK-008 (D-008) concluída: MongoAcordosRepository, schema bff_acordos, Compose atualizado; gates lint/test(28)/e2e(18)/build ✅ | Agente |
| 2026-11-01 | TASK-009 (D-009) concluída: Tailwind v4, redesign de todos os componentes, dark mode e a11y; gates lint/test(25)/build ✅ | Agente |
| 2026-11-01 | TASK-010 concluída: CSP do frontend corrigido (inlineCritical=false), CI verifica scripts inline; gates lint/test/build ✅ | Agente |
| 2026-11-02 | TASK-011 concluída: redesign premium P0+P1 (shell, dashboard, toolbar, modal, form, login, toasts); gates lint/test(51)/build ✅ | Agente |
