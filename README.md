# Nexus BFF Platform

Plataforma full-stack de gestão, conciliação e faturamento corporativo organizada como monorepo Nx.

| Item | Valor |
| ---- | ----- |
| Runtime | Node.js 24 |
| BFF | NestJS 11 |
| Frontend | Angular 22 (standalone, Signals) |
| Worker | NestJS 11 (RabbitMQ) |
| Banco | MongoDB 7 |
| Cache | Redis 7 |
| Mensageria | RabbitMQ 3 |
| Monorepo | Nx 24 + pnpm 9 |
| Linguagem | TypeScript 6 |

---

## Aplicações

| App | Descrição | Porta local |
| --- | --------- | ----------- |
| `apps/api-bff` | API Gateway / BFF (NestJS) | 3200 |
| `apps/ms-cobranca` | Worker assíncrono (RabbitMQ + MongoDB) | — |
| `apps/frontend-angular` | SPA Angular (WCAG 2.1 AA) | 5216 |
| `libs/common` | DTOs, interfaces e contratos compartilhados | — |

---

## Pré-requisitos

- Node.js 24+
- pnpm 9+
- Docker e Docker Compose (para rodar a stack completa)

---

## Instalação

```bash
git clone <repo-url>
cd nexus-bff-plataform
pnpm install
```

---

## Variáveis de ambiente

```bash
cp .env.example .env
# Edite .env conforme necessário (JWT_SECRET, credenciais do Compose etc.)
```

Nunca comite o `.env` com valores reais.

---

## Desenvolvimento local

```bash
# Sobe a infra (MongoDB, Redis, RabbitMQ)
docker compose up mongo redis rabbitmq -d

# BFF
pnpm nx serve api-bff

# Worker
pnpm nx serve ms-cobranca

# Frontend (proxy para o BFF via proxy.conf.json)
pnpm nx serve frontend-angular
```

Acessos:

- Frontend: http://localhost:5216
- API: http://localhost:3200/api

---

## Stack completa com Docker Compose

```bash
docker compose up --build -d
docker compose ps
```

| Serviço | URL local |
| ------- | --------- |
| Frontend | http://localhost:5216 |
| BFF | http://localhost:3200/api |
| RabbitMQ Management | http://localhost:8202 |

```bash
# Encerrar
docker compose down

# Encerrar e remover volumes
docker compose down -v
```

---

## Login de desenvolvimento (token padrão)

Para testar a interface sem configurar um provedor de identidade, use o token
abaixo. Ele é assinado com o `JWT_SECRET` padrão do `.env.example`
(`change-me-in-production`) e tem validade de **1 ano** (até 2027-11-02).

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYiLCJlbWFpbCI6ImRldkBuZXh1cy5sb2NhbCIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc5MzYyMjk4OSwiZXhwIjoxODI1MTU4OTg5LCJpc3MiOiJuZXh1cy1jb3JlIn0.HDJfaIDB8SK6qyQQk3XtFFtu35CRZFHZ5BRcsPxxDCs
```

1. Abra http://localhost:5216/login.
2. Cole o token no campo e clique em **Entrar**.

> **Somente desenvolvimento local.** Esse token concede papel `admin` e não
> deve ser usado em produção. Se você alterar `JWT_SECRET`, gere outro token:

```bash
node -e "const {JwtService}=require('@nestjs/jwt');const s=new JwtService({secret:process.env.JWT_SECRET||'change-me-in-production'});console.log(s.sign({sub:'dev',email:'dev@nexus.local',roles:['admin']},{expiresIn:'365d',issuer:'nexus-core'}))"
```

---

## Scripts raiz (Nx)

```bash
# Lint todos os projetos
pnpm nx run-many -t lint --exclude=nexus-core

# Testes unitários
pnpm nx run-many -t test --exclude=nexus-core

# Testes E2E do BFF
pnpm nx e2e api-bff

# Build de produção
pnpm nx run-many -t build --exclude=nexus-core

# Build de um projeto específico
pnpm nx build api-bff
pnpm nx build ms-cobranca
pnpm nx build frontend-angular
```

---

## Testes

### Unitários

Cada projeto possui seus próprios testes unitários com Jest (NestJS) e Vitest (Angular).

```
common          30 testes  (DTOs, interfaces, enums)
api-bff         18 testes  (guards, interceptors, service, controller)
ms-cobranca     14 testes  (controller, service, repositório Mongo)
frontend-angular 25 testes  (serviços, interceptors, componentes)
```

### E2E (BFF)

Testes de integração via Supertest que sobem o servidor NestJS completo:

```bash
pnpm nx e2e api-bff
```

Cobertura: health check, CRUD de Acordos, ValidationPipe (400), guards JWT (401), RBAC (403) e 404.

---

## Segurança

O BFF implementa os controles OWASP relevantes para uma API Gateway:

| Controle | Implementação |
| -------- | ------------- |
| A01 — Broken Access Control | `JwtAuthGuard` global + `RolesGuard` (RBAC) |
| A03 — Injection | `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` |
| A04 — Insecure Design | `ThrottlerModule` (rate limiting) |
| A05 — Security Misconfiguration | `helmet` (headers HTTP seguros) + CORS restrito |
| A09 — Logging & Monitoring | `LoggingInterceptor` estruturado (latência + auditoria) |

---

## Kubernetes

Manifestos em `k8s/` — agnósticos de cluster. Para validar localmente:

```bash
# Requer kubeconform instalado
kubeconform -strict -summary -ignore-missing-schemas k8s/

# Aplicar em cluster
kubectl apply -k k8s
kubectl -n nexus get deploy,svc,ingress,hpa
```

Veja `docs/infra.md` para guia completo de operação.

---

## CI/CD

`.github/workflows/ci.yml` executa em todo push/PR para `main` e `develop`:

1. Lint, testes unitários e build (todos os projetos Nx).
2. Build das imagens Docker e push para GHCR (em pushes para `develop`/`main`).
3. Validação dos manifestos Kubernetes com `kubeconform`.

---

## Estrutura do repositório

```
apps/
  api-bff/          NestJS BFF
  ms-cobranca/      NestJS Worker (RabbitMQ + MongoDB)
  frontend-angular/ Angular 22 SPA
libs/
  common/           DTOs e contratos compartilhados
k8s/                Manifestos Kubernetes
docs/               Documentação de operação e arquitetura
specs/              Especificações técnicas aprovadas (SPEC-001)
tasks/              Tarefas derivadas das specs (TASK-001 … TASK-007)
adr/                Architecture Decision Records
```

---

## Documentação adicional

| Documento | Descrição |
| --------- | --------- |
| `PROJECT.md` | Estado canônico do projeto |
| `docs/infra.md` | Guia de Docker Compose e Kubernetes |
| `UNIVERSAL_SDD_FRAMEWORK.md` | Processo de desenvolvimento (Universal SDD) |
| `AGENTS.md` | Protocolo para pessoas e agentes de IA |
| `specs/SPEC-001-nexus-core.md` | Especificação técnica aprovada |
| `adr/` | Decisões arquiteturais registradas |

---

## Contribuindo

Leia `CONTRIBUTING.md` antes de abrir um PR. Todo desenvolvimento segue o processo
Universal SDD: discovery → SPEC aprovada → TASK → implementação → QA → documentação.

---

## Licença

A definir (ver D-003 em `PROJECT.md`).
