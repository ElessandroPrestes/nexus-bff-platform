# PROJECT.md — Estado Canônico

> Este arquivo registra o **estado canônico atual** do projeto. Ele é a fonte de verdade sobre o que o projeto é, o que já existe e o que está aprovado. Divergências entre este arquivo, a SPEC e o código são tratadas como defeito, mudança de escopo ou dívida documental.

## 1. Identidade

| Campo | Valor |
| --- | --- |
| Nome | Nexus BFF Platform |
| Repositório | `nexus-bff-platform` |
| Tipo | Backend For Frontend (BFF) / plataforma de agregação de APIs |
| Status | Bootstrapping (framework instalado, produto em discovery) |
| Versão do framework | Universal SDD pré-1.0 |
| Licença | A definir |

## 2. Objetivo

Fornecer uma camada BFF que agrega, orquestra e adapta APIs de backend para consumo por aplicações frontend, com contratos explícitos, observabilidade e governança documental.

> **Pendente de discovery:** escopo funcional detalhado, domínios atendidos e consumidores ainda não foram aprovados. Não inventar requisitos — registrar em `specs/` após discovery.

## 3. Stack e Arquitetura

| Item | Valor |
| --- | --- |
| Linguagem | A definir (pendente de decisão arquitetural) |
| Framework | A definir |
| Arquitetura | A definir (candidata: BFF em camadas com adaptadores de integração) |
| Persistência | A definir |
| Mensageria | A definir |
| Observabilidade | A definir |

> Decisões arquiteturais devem ser registradas como ADRs em `adr/` **antes** da implementação. Ver `docs/architecture.md`.

## 4. Estrutura do Repositório

```
.
├── README.md
├── PROJECT.md
├── AGENTS.md
├── CLAUDE.md / GEMINI.md / COPILOT.md
├── UNIVERSAL_SDD_FRAMEWORK.md
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
- [ ] Discovery de produto e UX concluído.
- [ ] Arquitetura definida (ADRs).
- [ ] Design aprovado.
- [ ] Primeira SPEC aprovada.
- [ ] Primeira TASK implementada.
- [ ] Quality gates automatizados configurados.
- [ ] CI/CD configurado.

## 6. Convenções

- Commits seguem o padrão definido em `CONTRIBUTING.md`.
- Branches: `main` (estável), `develop` (integração), `feature/*`, `fix/*`, `chore/*`.
- Toda mudança relevante referencia uma SPEC e/ou ADR.

## 7. Dívidas e Pendências Conhecidas

| ID | Descrição | Impacto | Dono |
| --- | --- | --- | --- |
| D-001 | Stack tecnológica não definida | Bloqueia implementação | Arquitetura |
| D-002 | Escopo funcional do BFF não aprovado | Bloqueia SPECs | Produto |
| D-003 | Licença não definida | Bloqueia release público | Mantenedores |

## 8. Histórico de Atualizações

| Data | Mudança | Autor |
| --- | --- | --- |
| 2026-10-29 | Bootstrap do framework Universal SDD | — |
