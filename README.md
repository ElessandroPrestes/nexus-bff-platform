# Nexus BFF Platform

Plataforma de BFF (Backend For Frontend) organizada com o **Universal SDD** — um framework universal para aplicar Spec-Driven Development (SDD) com pessoas e agentes de IA de forma organizada, previsível e auditável.

> Status do framework: **em desenvolvimento ativo**. A API documental pode evoluir até a versão 1.0.

## O que é o Universal SDD?

O Universal SDD (USF) transforma requisitos aprovados em implementação rastreável, com um processo reutilizável para qualquer linguagem, arquitetura ou ferramenta de IA.

O framework usa três fontes complementares:

- a **SPEC** aprovada define o comportamento desejado de uma mudança;
- o **`PROJECT.md`** registra o estado canônico do projeto;
- o **código e as evidências de QA** demonstram o comportamento implementado.

Qualquer divergência entre essas fontes deve ser tratada como defeito, mudança de escopo ou dívida documental — **nunca** resolvida silenciosamente.

O framework é independente de linguagem, framework, arquitetura, plataforma e provedor de IA.

## Por que este projeto existe?

Ferramentas de IA aceleram o desenvolvimento, mas sem processo consistente é comum ocorrer expansão de escopo, requisitos inventados, alterações fora do objetivo, documentação inconsistente, perda de contexto entre sessões e dificuldade para revisar decisões. O Universal SDD organiza todo o ciclo de desenvolvimento por meio de especificações, tarefas, revisões e documentação versionada.

## Fluxo

```
Ideia
   ↓
Discovery de Produto e UX
   ↓
Arquitetura
   ↓
UX/UI Design
   ↓
Aprovação do Design
   ↓
SPEC técnica e funcional
   ↓
Aprovação Humana
   ↓
TASK
   ↓
Implementação
   ↓
QA automatizado e manual
   ↓
Design Review e Code Review
   ↓
Refatoração (se necessário)
   ↓
Documentação
   ↓
Release
```

## Estrutura

```
README.md
PROJECT.md
AGENTS.md
CLAUDE.md
GEMINI.md
COPILOT.md
UNIVERSAL_SDD_FRAMEWORK.md
agents/
workflows/
profiles/
knowledge/
standards/
templates/
specs/
tasks/
reviews/
adr/
docs/
```

## Documentação

| Documento | Objetivo |
| --- | --- |
| `README.md` | Visão geral do framework |
| `PROJECT.md` | Estado canônico atual do projeto |
| `UNIVERSAL_SDD_FRAMEWORK.md` | Definição normativa do núcleo |
| `AGENTS.md` | Protocolo comum para pessoas e agentes de IA |
| `docs/getting-started.md` | Primeiros passos |
| `docs/architecture.md` | Arquitetura do framework |
| `docs/agents.md` | Papéis e responsabilidades dos agentes |
| `docs/workflows.md` | Fluxos oficiais |
| `docs/knowledge-base.md` | Base de conhecimento |
| `docs/bootstrapping.md` | Inicialização de novos projetos |
| `docs/governance.md` | Regras e governança |
| `docs/best-practices.md` | Boas práticas |
| `docs/faq.md` | Perguntas frequentes |
| `CONTRIBUTING.md` | Como contribuir |
| `CHANGELOG.md` | Histórico de versões |
| `ROADMAP.md` | Evolução planejada |
| `CODE_OF_CONDUCT.md` | Código de conduta |
| `standards/ux-ui.md` | Processo e critérios de UX/UI |
| `standards/design-system.md` | Tokens, componentes e governança visual |
| `standards/accessibility.md` | Requisitos e validações de acessibilidade |
| `standards/testing.md` | Estratégia de testes e evidências |
| `standards/quality-gates.md` | Critérios de entrada, saída e release |
| `workflows/feature.md` | Fluxo completo de uma funcionalidade |
| `agents/` | Missões, responsabilidades e limites dos papéis |
| `templates/` | Artefatos executáveis de especificação, design, tarefas, testes e revisão |

## Princípios

1. A SPEC aprovada define o comportamento desejado da mudança.
2. O `PROJECT.md` registra o estado canônico do projeto.
3. Código e evidências de QA comprovam o comportamento entregue.
4. Toda implementação começa por uma SPEC.
5. Interfaces começam por discovery e design aprovados antes da implementação.
6. Toda SPEC precisa de aprovação humana.
7. A IA implementa apenas o escopo aprovado.
8. Toda implementação deve passar pelos quality gates aplicáveis.
9. Mudanças de interface exigem revisão de design e acessibilidade.
10. Mudanças arquiteturais geram ADRs.
11. A documentação evolui junto com o código.

## Primeiros Passos

1. Leia `PROJECT.md` para conhecer o estado canônico.
2. Leia `AGENTS.md` para o protocolo de trabalho.
3. Siga `docs/getting-started.md`.
4. Antes de implementar, garanta discovery, design e SPEC aprovados.
