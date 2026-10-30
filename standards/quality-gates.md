# Standard — Quality Gates

Portões **bloqueantes** entre etapas. Cada gate tem critérios de entrada e saída.

## G0 — Entrada em Discovery

- [ ] Problema e objetivo descritos.
- [ ] Dono identificado.

## G1 — Saída de Discovery / Entrada em Design

- [ ] Usuários e restrições mapeados.
- [ ] Riscos registrados.

## G2 — Saída de Design / Entrada em SPEC

- [ ] Design aprovado (interfaces).
- [ ] Acessibilidade considerada.

## G3 — Aprovação de SPEC

- [ ] Critérios de aceite testáveis.
- [ ] Não-objetivos explícitos.
- [ ] Aprovação humana registrada.

## G4 — Pronto para Implementação

- [ ] TASK criada e referenciando a SPEC.
- [ ] Escopo e dependências claros.

## G5 — Saída de Implementação

- [ ] Testes aplicáveis passam.
- [ ] Lint/typecheck passam (quando existirem).
- [ ] Evidências registradas.
- [ ] `PROJECT.md` atualizado se o estado mudou.

## G6 — Review

- [ ] Code review concluído.
- [ ] Design review concluído (interfaces).
- [ ] Acessibilidade validada (interfaces).

## G7 — Release

- [ ] Todos os gates anteriores satisfeitos.
- [ ] `CHANGELOG.md` atualizado.
- [ ] Sem segredos.
- [ ] Versão e tag definidas.

## Exceções

Exceções exigem registro com justificativa, dono e prazo.
