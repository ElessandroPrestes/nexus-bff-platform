# Getting Started

## 1. Conheça o estado canônico

Leia `PROJECT.md`. Ele diz o que o projeto é hoje, o que está aprovado e o que está pendente.

## 2. Entenda o protocolo

Leia `AGENTS.md` e `UNIVERSAL_SDD_FRAMEWORK.md`.

## 3. Escolha o fluxo

- Nova funcionalidade → `workflows/feature.md`.
- Nova interface → `standards/ux-ui.md` e `standards/accessibility.md`.
- Decisão arquitetural → `adr/` (use `templates/adr.md`).

## 4. Crie a SPEC

Copie `templates/spec.md` para `specs/<id>-<slug>.md` e preencha. Peça aprovação humana.

## 5. Crie a TASK

Copie `templates/task.md` para `tasks/<id>-<slug>.md` referenciando a SPEC.

## 6. Implemente e valide

Implemente apenas o escopo aprovado. Rode os testes e colete evidências conforme `standards/testing.md`.

## 7. Revise e documente

Registre o review em `reviews/` e atualize `PROJECT.md` e a documentação.

## Comandos úteis

A stack ainda não foi definida. Quando definida, os comandos de build/test/lint serão registrados no `PROJECT.md`.
