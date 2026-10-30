# Workflow — Feature

Fluxo completo de uma funcionalidade.

## 1. Ideia

- Registrar problema e objetivo.
- Identificar dono.

## 2. Discovery de Produto e UX

- Personas, jornadas, restrições, riscos.
- Gate G1.

## 3. Arquitetura

- ADRs para decisões.
- Atualizar `PROJECT.md`.

## 4. UX/UI Design (se houver interface)

- Fluxos, protótipos, acessibilidade.
- Gate G2.

## 5. SPEC

- Copiar `templates/spec.md` → `specs/<id>-<slug>.md`.
- Critérios de aceite, não-objetivos, perguntas abertas.
- **Aprovação humana** — Gate G3.

## 6. TASK

- Copiar `templates/task.md` → `tasks/<id>-<slug>.md`.
- Decompor, estimar, listar dependências — Gate G4.

## 7. Implementação

- Apenas escopo aprovado.
- Testes junto com o código.

## 8. QA

- Automatizado + manual.
- Evidências registradas.

## 9. Review

- Code review e design review.
- Registrar em `reviews/` — Gate G6.

## 10. Refatoração (se necessário)

- Dentro do escopo, com testes.

## 11. Documentação

- Atualizar `PROJECT.md`, `docs/`, `CHANGELOG.md`.

## 12. Release

- Gate G7.
- Tag semântica.
