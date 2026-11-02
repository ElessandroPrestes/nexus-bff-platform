# Nexus BFF Platform

> Plataforma full-stack de **gestão de acordos, conciliação e faturamento corporativo**, construída como monorepo com arquitetura **BFF (Backend for Frontend)**, processamento assíncrono e foco em segurança e acessibilidade.

![Node](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3-FF6600?logo=rabbitmq&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 👋 Para quem está avaliando este projeto

Este é um projeto de portfólio que simula um cenário corporativo real. Ele foi desenhado para demonstrar, em um único repositório:

- **Arquitetura BFF**: uma camada de API que atende exclusivamente às necessidades do frontend, isolando-o dos serviços internos.
- **Processamento assíncrono**: tarefas pesadas saem do ciclo de requisição e vão para um worker via fila.
- **Segurança por padrão**: autenticação JWT, RBAC, validação rigorosa de entrada, rate limiting e headers seguros, alinhados ao OWASP.
- **Qualidade de engenharia**: testes unitários e E2E, CI/CD, manifestos Kubernetes e decisões arquiteturais documentadas (ADRs).
- **Processo**: desenvolvimento guiado por especificação (SDD): discovery → SPEC → TASK → implementação → QA.

A arquitetura se inspira em padrões de BFF usados em sistemas corporativos de grande porte, adaptados aqui para um domínio próprio e sem qualquer código ou dado de terceiros.

---

## 🎯 Qual problema este projeto resolve?

Em muitas empresas, acordos comerciais, cobranças e conciliações financeiras vivem espalhados entre planilhas, sistemas legados e processos manuais. Isso gera:

| Problema | Consequência |
|---|---|
| Dados fragmentados em várias fontes | Retrabalho e divergências entre áreas |
| Conciliação e faturamento manuais | Erros, atrasos e baixa rastreabilidade |
| Frontend acoplado a vários serviços | Telas lentas, regras duplicadas e difíceis de manter |
| Processamento pesado dentro da requisição HTTP | Timeouts e experiência ruim para o usuário |
| Controle de acesso e auditoria frágeis | Risco de segurança e de conformidade |

## 💡 Como o Nexus resolve

- **Ponto único de entrada (BFF)**: o frontend conversa com uma única API, que autentica, valida, agrega e protege o acesso aos serviços internos.
- **Fila + worker**: operações de cobrança e faturamento são enfileiradas no RabbitMQ e processadas de forma assíncrona pelo `ms-cobranca`, sem bloquear o usuário.
- **Persistência dedicada**: o worker é dono dos dados de cobrança no MongoDB, com repositório próprio.
- **Controle de acesso por papéis**: rotas protegidas por JWT e RBAC (ex.: `admin`).
- **Interface acessível**: SPA em Angular com Signals, seguindo WCAG 2.1 AA.
- **Observabilidade**: logs estruturados com latência e trilha de auditoria por requisição.

---

## ✨ Funcionalidades

- Gestão de **Acordos** (CRUD completo, com validação de entrada e controle de acesso)
- Processamento assíncrono de **cobrança** via mensageria
- Autenticação **JWT** e autorização por **papéis (RBAC)**
- **Rate limiting** e headers HTTP seguros
- Contratos (DTOs, interfaces, enums) **compartilhados** entre front e back em `libs/common`
- Interface acessível (**WCAG 2.1 AA**)
- Stack completa com **Docker Compose** e manifestos **Kubernetes**

---

## 🏗️ Arquitetura

```mermaid
flowchart LR
    U[Usuário] --> FE[Frontend Angular<br/>SPA · Signals]
    FE -->|HTTP + JWT| BFF[API BFF<br/>NestJS]
    BFF -->|cache / throttling| R[(Redis)]
    BFF -->|publica mensagens| MQ{{RabbitMQ}}
    MQ -->|consome| W[Worker ms-cobranca<br/>NestJS]
    W --> DB[(MongoDB)]
    C[libs/common<br/>DTOs e contratos] -.compartilhado.-> FE
    C -.compartilhado.-> BFF
    C -.compartilhado.-> W
```

### Decisões de design

- **Por que BFF?** Centraliza autenticação, validação e agregação, e mantém o frontend simples e desacoplado dos serviços internos.
- **Por que mensageria?** Isola operações demoradas e permite escalar o worker de forma independente do BFF.
- **Por que monorepo Nx?** Compartilha tipos entre front e back, garante consistência e acelera build, lint e testes com cache.
- **Registro das decisões:** veja a pasta [`adr/`](./adr).

---

## 🧰 Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 24 |
| BFF | NestJS 11 |
| Frontend | Angular 22 (standalone components, Signals) |
| Worker | NestJS 11 + RabbitMQ |
| Banco de dados | MongoDB 7 |
| Cache | Redis 7 |
| Mensageria | RabbitMQ 3 |
| Monorepo | Nx 24 + pnpm 9 |
| Linguagem | TypeScript 6 |
| Testes | Jest, Vitest, Supertest |
| Infra | Docker Compose, Kubernetes, GitHub Actions |

### Aplicações

| App | Descrição | Porta local |
|---|---|---|
| `apps/api-bff` | API Gateway / BFF (NestJS) | 3200 |
| `apps/ms-cobranca` | Worker assíncrono (RabbitMQ + MongoDB) | — |
| `apps/frontend-angular` | SPA Angular (WCAG 2.1 AA) | 5216 |
| `libs/common` | DTOs, interfaces e contratos compartilhados | — |

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 24+
- pnpm 9+
- Docker e Docker Compose

### Opção 1 — Stack completa com Docker (mais rápido)

```bash
git clone git@github.com:ElessandroPrestes/nexus-bff-platform.git
cd nexus-bff-platform
cp .env.example .env
docker compose up --build -d
docker compose ps
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5216 |
| BFF | http://localhost:3200/api |
| RabbitMQ Management | http://localhost:8202 |

```bash
docker compose down        # encerrar
docker compose down -v     # encerrar e remover volumes
```

### Opção 2 — Desenvolvimento local

```bash
pnpm install
cp .env.example .env

# Infra (MongoDB, Redis, RabbitMQ)
docker compose up mongo redis rabbitmq -d

# Em terminais separados
pnpm nx serve api-bff
pnpm nx serve ms-cobranca
pnpm nx serve frontend-angular   # proxy para o BFF via proxy.conf.json
```

> Nunca comite o `.env` com valores reais.

---

## 🔑 Testando a interface (login de desenvolvimento)

Para explorar a interface sem configurar um provedor de identidade, use o token
padrão abaixo — ele é assinado com o `JWT_SECRET` do `.env.example`
(`change-me-in-production`) e vale até **2027-11-02**:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYiLCJlbWFpbCI6ImRldkBuZXh1cy5sb2NhbCIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc5MzYyMjk4OSwiZXhwIjoxODI1MTU4OTg5LCJpc3MiOiJuZXh1cy1jb3JlIn0.HDJfaIDB8SK6qyQQk3XtFFtu35CRZFHZ5BRcsPxxDCs
```

1. Abra http://localhost:5216/login
2. Cole o token no campo e clique em **Entrar**

Se você alterou o `JWT_SECRET`, gere outro token:

```bash
node -e "const {JwtService}=require('@nestjs/jwt');const s=new JwtService({secret:process.env.JWT_SECRET||'change-me-in-production'});console.log(s.sign({sub:'dev',email:'dev@nexus.local',roles:['admin']},{expiresIn:'1d',issuer:'nexus-core'}))"
```

> ⚠️ **Somente desenvolvimento local.** O token concede papel `admin`. Em produção, use um `JWT_SECRET` forte e um provedor de identidade real.

---

## 🧪 Testes

| Projeto | Testes | Cobertura |
|---|---|---|
| `libs/common` | 30 | DTOs, interfaces, enums |
| `apps/api-bff` | 28 | guards, interceptors, service, controller |
| `apps/ms-cobranca` | 14 | controller, service, repositório Mongo |
| `apps/frontend-angular` | 51 | serviços, interceptors, componentes |

```bash
pnpm nx run-many -t test --exclude=nexus-core   # unitários
pnpm nx e2e api-bff                             # E2E do BFF (Supertest)
pnpm nx run-many -t lint --exclude=nexus-core   # lint
```

Os testes E2E sobem o servidor NestJS completo e cobrem: health check, CRUD de Acordos, `ValidationPipe` (400), guards JWT (401), RBAC (403) e 404.

---

## 🔒 Segurança

Controles do OWASP aplicados ao BFF:

| Risco OWASP | Implementação |
|---|---|
| A01 — Broken Access Control | `JwtAuthGuard` global + `RolesGuard` (RBAC) |
| A03 — Injection | `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` |
| A04 — Insecure Design | `ThrottlerModule` (rate limiting) |
| A05 — Security Misconfiguration | `helmet` (headers seguros) + CORS restrito |
| A09 — Logging & Monitoring | `LoggingInterceptor` estruturado (latência + auditoria) |

---

## ☸️ Infra e CI/CD

- **Kubernetes:** manifestos em [`k8s/`](./k8s), agnósticos de cluster. Guia completo em [`docs/infra.md`](./docs/infra.md).
  ```bash
  kubeconform -strict -summary -ignore-missing-schemas k8s/
  kubectl apply -k k8s
  ```
- **CI/CD (GitHub Actions)**, em todo push/PR para `main` e `develop`:
  1. Lint, testes unitários e build de todos os projetos Nx
  2. Build das imagens Docker e push para o GHCR
  3. Validação dos manifestos Kubernetes com `kubeconform`

### Build de produção

```bash
pnpm nx run-many -t build --exclude=nexus-core
pnpm nx build api-bff   # ou ms-cobranca / frontend-angular
```

---

## 📁 Estrutura do repositório

```
apps/
  api-bff/            NestJS BFF
  ms-cobranca/        NestJS Worker (RabbitMQ + MongoDB)
  frontend-angular/   Angular 22 SPA
libs/
  common/             DTOs e contratos compartilhados
k8s/                  Manifestos Kubernetes
docs/                 Documentação de operação e arquitetura
specs/                Especificações técnicas aprovadas (SPEC-001 … SPEC-006)
tasks/                Tarefas derivadas das specs (TASK-001 … TASK-012)
adr/                  Architecture Decision Records
```

## 📚 Documentação adicional

| Documento | Descrição |
|---|---|
| [`PROJECT.md`](./PROJECT.md) | Estado canônico do projeto |
| [`docs/infra.md`](./docs/infra.md) | Docker Compose e Kubernetes |
| [`specs/SPEC-001-nexus-core.md`](./specs/SPEC-001-nexus-core.md) | Especificação técnica aprovada |
| [`adr/`](./adr) | Decisões arquiteturais registradas |
| [`UNIVERSAL_SDD_FRAMEWORK.md`](./UNIVERSAL_SDD_FRAMEWORK.md) | Processo de desenvolvimento (Universal SDD) |
| [`AGENTS.md`](./AGENTS.md) | Protocolo para pessoas e agentes de IA |

## 🤝 Contribuindo

Leia [`CONTRIBUTING.md`](./CONTRIBUTING.md) antes de abrir um PR. O desenvolvimento segue o processo Universal SDD: discovery → SPEC aprovada → TASK → implementação → QA → documentação.

---

## 👤 Autor

**Elessandro Prestes**
[GitHub](https://github.com/ElessandroPrestes)

## 📄 Licença

Distribuído sob a licença MIT. Consulte [`LICENSE`](./LICENSE). Copyright © 2026 Elessandro Prestes.
