# Standard — Testes

## Objetivo

Definir estratégia de testes e evidências rastreáveis.

## Pirâmide

- **Unitários** — lógica isolada, rápidos.
- **Integração** — contratos entre módulos e adaptadores.
- **E2E** — fluxos críticos ponta a ponta.
- **Manuais** — exploração e acessibilidade.

## Cobertura mínima

- Todo critério de aceite da SPEC deve ter teste correspondente.
- Fluxos críticos exigem teste de integração ou E2E.
- Cobertura mínima numérica: a definir com a stack.

## Evidências

- Resultado dos testes anexado à TASK/review.
- Logs e relatórios versionados ou referenciados.
- Testes de regressão para defeitos corrigidos.

## Convenções

- Nomear testes pelo comportamento esperado.
- Testes determinísticos e independentes.
- Sem segredos em fixtures.

## Pendências

- [ ] Definir ferramentas de teste com a stack.
