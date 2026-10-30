# CONTRIBUTING.md — Como Contribuir

## Antes de começar

Leia `PROJECT.md`, `UNIVERSAL_SDD_FRAMEWORK.md` e `AGENTS.md`. Toda contribuição segue o fluxo Spec-Driven Development.

## Fluxo

1. Abra/associe uma SPEC em `specs/` (use `templates/spec.md`).
2. Aguarde aprovação humana da SPEC.
3. Crie a TASK em `tasks/` (use `templates/task.md`).
4. Implemente apenas o escopo aprovado.
5. Execute testes e colete evidências.
6. Registre o review em `reviews/`.
7. Atualize `PROJECT.md` e a documentação afetada.
8. Abra o PR referenciando SPEC e TASK.

## Branches

- `main` — estável.
- `develop` — integração.
- `feature/<slug>` — funcionalidades.
- `fix/<slug>` — correções.
- `chore/<slug>` — manutenção.
- `docs/<slug>` — documentação.

## Commits

Formato: `<tipo>(<escopo>): <descrição>`

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`, `perf`.

Exemplo: `feat(auth): adiciona agregador de sessão`

## Checklist de PR

- [ ] SPEC aprovada e referenciada.
- [ ] TASK referenciada.
- [ ] Testes adicionados/atualizados.
- [ ] Quality gates atendidos.
- [ ] `PROJECT.md` atualizado se o estado mudou.
- [ ] Sem segredos no diff.

## Conduta

Siga o `CODE_OF_CONDUCT.md`.
