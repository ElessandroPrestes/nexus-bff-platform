# ADR-0001 — Ferramenta de Monorepo

## Metadados

| Campo | Valor |
| --- | --- |
| ID | ADR-0001 |
| Status | Aceito |
| Data | 2026-10-29 |
| Aprovação | Elessandro em 2026-10-29 |

## Contexto

Precisamos de um monorepo com Angular, NestJS (duas apps) e uma lib compartilhada, com build/lint/test orquestrados, cache e geração de código consistente. O ambiente tem Node 24, pnpm 9 e Nx 24 disponíveis.

## Decisão

Adotar **Nx 24** com **pnpm** como workspace manager.

## Alternativas consideradas

| Alternativa | Prós | Contras |
| --- | --- | --- |
| Nx + pnpm | Plugins nativos Angular/Nest, project graph, cache, generators, convenção `apps/`/`libs/` | Curva de aprendizado, mais configuração |
| pnpm workspaces + Turborepo | Simples, rápido | Sem plugins de framework; scripts manuais |
| npm workspaces | Nativo | Sem cache/orquestração robusta |

## Consequências

- Estrutura `apps/` e `libs/` alinhada ao requisito.
- Targets `lint`/`test`/`build` orquestrados por `nx run-many`.
- Cache local/remoto habilitável no CI.
- Time precisa conhecer Nx.

## Relacionados

SPEC-001, ADR-0002.
