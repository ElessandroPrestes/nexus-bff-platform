# TASK-012 — Corrigir cache do index.html e 404 de chunks

## Metadados

| Campo             | Valor                    |
| ----------------- | ------------------------ |
| ID                | TASK-012                 |
| SPEC              | SPEC-006                 |
| Autor             | Agente                   |
| Status            | **Concluída**            |
| Prioridade        | Alta                     |
| Depende de        | TASK-010, TASK-011       |
| Data de início    | 2026-11-02               |
| Data de conclusão | 2026-11-02               |

## 1. Descrição

Corrigir o carregamento de chunks após deploy. O navegador mantinha um
`index.html` antigo em cache heurístico, que referenciava `chunk-CzhWRLvO.js`;
o arquivo já não existia no servidor, causando 404 e falha de import dinâmico.

## 2. Escopo

### Arquivos modificados

```
apps/frontend-angular/nginx.conf
specs/SPEC-006-cache-frontend.md
tasks/TASK-012-cache-frontend.md
reviews/REV-003-TASK-012.md
PROJECT.md
CHANGELOG.md
```

### Fora de escopo

- Componentes, rotas, serviços e testes de lógica do frontend.
- CSP e `Content-Security-Policy`.
- BFF, worker, Compose e manifestos K8s.

## 3. Dependências

- SPEC-006 aprovada.
- Build de produção do frontend disponível.

## 4. Passos

1. Classificar requisições por extensão com `map $uri`.
2. Enviar `Cache-Control` no nível `server`, preservando a herança dos headers
   de segurança.
3. Remover `expires`/`add_header` do `location` de assets.
4. Rebuild da imagem e recreate do container.
5. Validar headers com `curl -I`.
6. Validar login JWT e navegação com navegador limpo.
7. Rodar gates e atualizar documentação.

## 5. Testes

- [x] `index.html` e rotas SPA com `Cache-Control: no-store`.
- [x] Assets JS/CSS com `Cache-Control: public, max-age=31536000, immutable`.
- [x] `nosniff` e CSP presentes em HTML e assets.
- [x] Login + dashboard + listagem sem 404 de chunks.
- [x] `pnpm nx run-many -t lint test build --exclude=nexus-core` verde.

## 6. Evidências

| Verificação | Resultado |
| ----------- | --------- |
| `GET /` | `200`, `Cache-Control: no-store` |
| `GET /index.html` | `200`, `Cache-Control: no-store` |
| `GET /main-*.js` | `200`, `Cache-Control: public, max-age=31536000, immutable` |
| `X-Content-Type-Options` em JS | ✅ `nosniff` |
| Navegador limpo (Playwright) | ✅ login JWT, dashboard e 10 linhas em `/acordos`, 0 erros de console |
| Gates | ✅ lint/test(51)/build 4/4 |

Comandos executados:

```
docker compose build frontend
docker compose up -d --no-deps --force-recreate frontend
curl -sI http://localhost:5216/
curl -sI http://localhost:5216/index.html
curl -sI http://localhost:5216/main-*.js
pnpm nx run-many -t lint test build --exclude=nexus-core
```

## 7. Definition of Done

- [x] Comportamento aprovado implementado.
- [x] Testes passam.
- [x] Quality gates satisfeitos.
- [x] Documentação/`PROJECT.md` atualizados.
- [x] Review registrado em `REV-003`; validação humana pendente (D-014).
