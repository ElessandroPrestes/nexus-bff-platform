# REV-003 — TASK-012 (cache do frontend)

## Metadados

| Campo    | Valor       |
| -------- | ----------- |
| ID       | REV-003     |
| TASK     | TASK-012    |
| SPEC     | SPEC-006    |
| Autor    | Agente      |
| Data     | 2026-11-02  |
| Tipo     | Auto-review |
| Status   | Aprovado com validação humana pendente |

## 1. Escopo revisado

- `apps/frontend-angular/nginx.conf`
- Documentação SDD da TASK-012

## 2. Verificações

| Item | Resultado |
| ---- | --------- |
| `index.html`/rotas SPA com `no-store` | ✅ |
| Assets com `immutable` | ✅ |
| Headers de segurança preservados em assets | ✅ |
| Login JWT + navegação sem 404 de chunks | ✅ |
| Gates lint/test/build | ✅ 4/4 |
| Escopo restrito ao servidor estático | ✅ |

## 3. Observações

- A causa raiz foi cache heurístico do `index.html`, não o JWT. O token estava
  correto; as rotas lazy falhavam antes de concluir o login.
- O `add_header` no `location` de assets interrompia a herança dos headers do
  `server`. A política agora fica no nível `server` e é herdada por todos os
  `location`s.
- O usuário deve recarregar uma vez (ou usar aba anônima) para descartar o HTML
  antigo já cacheado antes do deploy.

## 4. Pendências

- D-014: validação humana formal (gate G6).
