# UNIVERSAL_SDD_FRAMEWORK.md — Definição Normativa do Núcleo

Este documento é normativo. Em caso de conflito com qualquer outro material, prevalece este arquivo, salvo decisão explícita de governança registrada em `adr/`.

## 1. Definição

O Universal SDD (USF) é um framework para desenvolvimento orientado por especificações. Ele define **artefatos**, **papéis**, **fluxos** e **portões de qualidade** que tornam a implementação rastreável e auditável.

## 2. Fontes de verdade

| Fonte | Papel |
| --- | --- |
| SPEC aprovada | Define o comportamento desejado da mudança |
| `PROJECT.md` | Registra o estado canônico do projeto |
| Código + evidências de QA | Comprovam o comportamento implementado |

Divergência entre fontes é sempre um defeito, mudança de escopo ou dívida documental. **Nunca** deve ser resolvida silenciosamente.

## 3. Artefatos canônicos

| Artefato | Local | Obrigatório |
| --- | --- | --- |
| SPEC | `specs/` | Sim, antes de implementar |
| TASK | `tasks/` | Sim, derivada da SPEC |
| Plano de teste | `templates/test-plan.md` → `tasks/` | Sim |
| Registro de review | `reviews/` | Sim |
| ADR | `adr/` | Sim para mudanças arquiteturais |
| Atualização do `PROJECT.md` | raiz | Sim quando o estado muda |

## 4. Ciclo de vida

1. **Ideia** — capturada como rascunho.
2. **Discovery de Produto e UX** — problema, usuários, restrições, riscos.
3. **Arquitetura** — decisões e ADRs.
4. **UX/UI Design** — para interfaces.
5. **Aprovação do Design** — humana.
6. **SPEC técnica e funcional** — comportamento, critérios de aceite, não-objetivos.
7. **Aprovação Humana da SPEC** — obrigatória.
8. **TASK** — decomposição executável.
9. **Implementação** — apenas escopo aprovado.
10. **QA** — automatizado e manual, com evidências.
11. **Design Review e Code Review**.
12. **Refatoração** — se necessária, dentro do escopo.
13. **Documentação** — atualizada junto.
14. **Release** — após quality gates.

## 5. Portões de qualidade

Um artefato só avança de etapa quando os critérios de entrada e saída de `standards/quality-gates.md` são atendidos. Portões são **bloqueantes**.

## 6. Papéis

Os papéis estão em `agents/`. Um agente de IA pode assumir um papel, mas **nunca** aprova em nome de uma pessoa.

## 7. Independência de tecnologia

O framework não prescreve linguagem, framework, arquitetura, plataforma ou provedor de IA. As escolhas específicas são registradas em `PROJECT.md` e em ADRs.

## 8. Versionamento

O framework evolui até a versão 1.0. Mudanças na API documental são registradas em `CHANGELOG.md` e planejadas em `ROADMAP.md`.
