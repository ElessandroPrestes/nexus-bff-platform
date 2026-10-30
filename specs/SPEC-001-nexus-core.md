# SPEC-001 — Nexus Core (Monorepo Full-Stack)

## Metadados

| Campo | Valor |
| --- | --- |
| ID | SPEC-001 |
| Autor | Agente (Spec Author) |
| Status | Aprovada |
| Data | 2026-10-29 |
| Aprovação | Elessandro em 2026-10-29 |
| Relacionados | ADR-0001, ADR-0002, ADR-0003, TASK-001 |

## 1. Contexto

O projeto precisa de um monorepo full-stack de alta performance, resiliente, acessível, seguro e pronto para produção, chamado **Nexus Core** — um sistema distribuído de gestão, conciliação e faturamento corporativo.

O repositório hoje contém apenas o framework Universal SDD (ver `PROJECT.md`). Esta SPEC define o comportamento e o escopo do programa, decomposto em fases executáveis.

## 2. Objetivo

Entregar um monorepo com:

- **`apps/frontend-angular`** (nexus-web): Angular moderno (standalone, Signals, RxJS, lazy loading, interceptors, a11y WCAG 2.1 AA, dark/light, performance).
- **`apps/api-bff`** (nexus-bff): NestJS como API Gateway/BFF, SOLID, controles OWASP (A01, A03, A04, A05, A09).
- **`apps/ms-cobranca`** (nexus-worker): microsserviço consumidor RabbitMQ com persistência MongoDB desacoplada.
- **`libs/common`** (nexus-common): DTOs, interfaces e contratos puros compartilhados.
- **Infra**: Docker/Docker Compose, manifestos Kubernetes production-ready, GitHub Actions CI/CD.

## 3. Escopo

O programa é dividido em fases sequenciais, cada uma com sua própria TASK e gates:

1. **Fase 1 — Bootstrap do Monorepo, Segurança & SOLID Base** (TASK-001).
2. **Fase 2 — Biblioteca Compartilhada (`libs/common`)**.
3. **Fase 3 — API BFF com controles OWASP e SOLID (`apps/api-bff`)**.
4. **Fase 4 — Microsserviço de Cobrança (`apps/ms-cobranca`)**.
5. **Fase 5 — Frontend Angular (`apps/frontend-angular`)**.
6. **Fase 6 — Docker, Kubernetes & GitHub Actions**.
7. **Fase 7 — Testes e Documentação**.

## 4. Não-objetivos

- Definir regras de negócio de conciliação/faturamento além do necessário para os contratos.
- Integrar provedores de pagamento reais (será SPEC futura).
- Multi-tenancy avançado e faturamento fiscal (fora deste programa).
- Interface de administração além das telas previstas na Fase 5.

## 5. Comportamento esperado (por fase)

### Fase 1 — Bootstrap
- Monorepo inicializado com Nx + pnpm, estrutura `apps/` e `libs/`.
- Projetos `frontend-angular`, `api-bff`, `ms-cobranca`, `common` criados.
- BFF com `helmet` e `ThrottlerModule` configurados globalmente.
- Dependências de validação (`class-validator`, `class-transformer`) e JWT (`@nestjs/jwt`, `@nestjs/passport`) instaladas.
- Lint/format (ESLint + Prettier) e targets `build`/`test`/`lint` funcionando.

### Fase 2 — `libs/common`
- `CreateAcordoDto` validado (`class-validator`).
- Interfaces/contratos tipados compartilhados entre front e back.
- Sem dependência de framework de transporte na lib.

### Fase 3 — BFF
- `JwtAuthGuard`, `RolesGuard` e `LoggingInterceptor` (latência, auditoria).
- Controllers enxutos; Services especializados (SRP); dependências por interface (DIP).
- `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Rate limiting e headers seguros.

### Fase 4 — ms-cobranca
- Listener RabbitMQ (`@nestjs/microservices`).
- Repositório MongoDB desacoplado (interface + implementação).
- Tratamento de erro, retry e idempotência.

### Fase 5 — Frontend
- Standalone components, rotas lazy, Signals + RxJS.
- Interceptor JWT e tratamento global de erros.
- Dark/light, responsivo, WCAG 2.1 AA, OnPush onde aplicável.

### Fase 6 — Infra
- Dockerfiles multi-stage (frontend via Nginx).
- `docker-compose.yml` com MongoDB, Redis, RabbitMQ.
- `k8s/` com Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, probes.
- CI/CD GitHub Actions: lint, testes, build de imagens, validação de manifestos.

### Fase 7 — Testes e Docs
- E2E no BFF (Jest/Supertest); unitários no Angular (Vitest ou Jasmine/Karma).
- `README.md` executivo.

## 6. Critérios de aceite (programa)

- [ ] Estrutura `apps/` + `libs/` criada e buildável.
- [ ] `nx run-many -t lint test build` executa sem erros.
- [ ] BFF aplica helmet, throttler, validation pipe e guards.
- [ ] `CreateAcordoDto` compartilhado e validado.
- [ ] Worker consome RabbitMQ e persiste em MongoDB via repositório desacoplado.
- [ ] Frontend autentica com JWT, trata erros e é acessível.
- [ ] Docker Compose sobe o stack completo.
- [ ] Manifestos K8s validáveis.
- [ ] Pipeline CI verde.
- [ ] README executivo publicado.

## 7. Interfaces e dados

- Contrato inicial: recurso **Acordo** (`CreateAcordoDto`).
- Transporte síncrono: REST no BFF (versão `/api/v1`).
- Transporte assíncrono: RabbitMQ (fila de cobrança).
- Persistência: MongoDB (worker).

## 8. Requisitos não-funcionais

- **Segurança**: OWASP A01/A03/A04/A05/A09 conforme ADR-0003.
- **Performance**: latência de requisição no BFF < 300ms (observada via `LoggingInterceptor`).
- **Acessibilidade**: WCAG 2.1 AA.
- **Resiliência**: probes, HPA, retry/idempotência no worker.
- **Qualidade**: lint, testes e builds no CI.

## 9. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Versões muito recentes (Angular 22, Nest 12, Nx 24, TS 7) com APIs instáveis | Build quebrado | ADR-0002 fixa versões; ajustar geradores na execução |
| Escopo amplo em 7 fases | Atraso | Fases sequenciais com gates |
| Falta de credenciais/segredos reais | Bloqueio de deploy | `.env.example` + Secrets no K8s |
| Sem cluster K8s local | Validação parcial | `kubectl --dry-run=client` + kubeconform |

## 10. Perguntas abertas

- [ ] Qual provedor de identidade/JWT (emissor, claims, expiração)?
- [ ] Qual o schema real de Acordo e regras de negócio?
- [ ] Qual registry de imagens (GHCR/Docker Hub)?
- [ ] Qual ambiente-alvo de K8s?

## 11. Aprovação

| Nome | Papel | Data | Decisão |
| --- | --- | --- | --- |
| Elessandro | Product Owner / Tech Lead | 2026-10-29 | Aprovado |
