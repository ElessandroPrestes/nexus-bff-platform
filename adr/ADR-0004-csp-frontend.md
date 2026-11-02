# ADR-0004 — CSP do Frontend e Inlining de CSS Crítico

## Metadados

| Campo     | Valor                 |
| --------- | --------------------- |
| ID        | ADR-0004              |
| Status    | Aceito                |
| Data      | 2026-11-01            |
| Aprovação | Elessandro em 2026-11-01 |

## Contexto

O frontend é servido por Nginx com `script-src 'self'`. O build de produção do
Angular injeta um script inline do `beasties` para ativar o CSS crítico. O CSP
bloqueia o script e a página fica sem estilos.

## Decisão

Desabilitar o inlining de CSS crítico no build de produção
(`optimization.styles.inlineCritical = false`) e manter a CSP restritiva com
`script-src 'self'`.

Uma verificação no CI falha caso scripts inline reapareçam no `index.html`.

## Alternativas consideradas

| Alternativa | Prós | Contras |
| ----------- | ---- | ------- |
| Desabilitar CSS crítico inline (escolhida) | CSP estrito; estável em upgrades | Perde inlining de ~5 kB gzip |
| Adicionar hash do script ao `script-src` | Mantém inlining | Hash quebra silenciosamente em upgrades do Angular/beasties |
| `script-src 'unsafe-inline'` | Simples | Enfraquece proteção contra XSS |

## Consequências

- CSP permanece restritiva e auditável.
- O `index.html` fica sem scripts inline, simplificando a política.
- Pequeno impacto no first paint, considerado desprezível para o tamanho do
  bundle atual.
- Qualquer reintrodução de inlining é detectada pelo CI.

## Relacionados

SPEC-004, TASK-010, ADR-0003.
