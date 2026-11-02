# TASK-010 — Corrigir violação de CSP no frontend (CSS crítico inline)

## Metadados

| Campo             | Valor                    |
| ----------------- | ------------------------ |
| ID                | TASK-010                 |
| SPEC              | SPEC-004                 |
| Autor             | Agente                   |
| Status            | **Concluída**            |
| Prioridade        | Alta                     |
| Depende de        | TASK-009 (concluída)     |
| Data de início    | 2026-11-01               |
| Data de conclusão | 2026-11-01               |

## 1. Descrição

Remover a violação de CSP causada pelo script inline do `beasties` no
`index.html` de produção, sem enfraquecer a política de segurança.

## 2. Escopo

### Arquivos a modificar

```
apps/frontend-angular/project.json      # optimization.styles.inlineCritical = false
.github/workflows/ci.yml                # verificação de scripts inline no index.html
tasks/TASK-010-csp-frontend.md          # DoD + evidências
PROJECT.md
CHANGELOG.md
```

### Fora de escopo

- `apps/frontend-angular/nginx.conf` (CSP permanece `script-src 'self'`).
- Componentes, rotas, serviços e testes de lógica do frontend.
- BFF e worker.

## 3. Dependências

- SPEC-004 aprovada.
- ADR-0004 aceito.

## 4. Passos

1. Adicionar `optimization.styles.inlineCritical = false` à configuração de
   produção do `frontend-angular`.
2. Adicionar etapa no CI que falha se houver `<script>` inline no `index.html`.
3. Rodar build de produção e validar o `index.html` gerado.
4. Rodar gates `lint test build`.
5. Atualizar evidências, `PROJECT.md` e `CHANGELOG.md`.

## 5. Testes

- [x] Build de produção sem `<script>` inline no `index.html`.
- [x] CSP do Nginx inalterada (`script-src 'self'`).
- [x] Verificação manual no navegador sem erro de CSP e com estilos.
- [x] `pnpm nx run-many -t lint test build --exclude=nexus-core` verde.

## 6. Evidências

| Verificação | Resultado |
| ----------- | --------- |
| `index.html` de produção | ✅ 0 scripts inline; `<link rel="stylesheet" href="styles-*.css">` normal |
| CSP servida por Nginx | ✅ `script-src 'self'` inalterada |
| Container `nexus-frontend-1` | ✅ imagem reconstruída, status `healthy` |
| Verificação de CI (script inline) | ✅ `OK: nenhum script inline no index.html` |
| Gates `lint test build` | ✅ 4/4 projetos |
| Navegador | ✅ login e listagem renderizados com estilos (claro e escuro) |

Comandos executados:

```
pnpm nx run frontend-angular:build
docker compose build frontend
docker compose up -d --no-deps --force-recreate frontend
pnpm nx run-many -t lint test build --exclude=nexus-core
```

## 7. Definition of Done

- [x] Comportamento aprovado implementado.
- [x] Testes passam.
- [x] Quality gates satisfeitos.
- [x] Documentação/`PROJECT.md` atualizados.
- [x] Review registrado (REV-001); validação humana pendente (D-012).
