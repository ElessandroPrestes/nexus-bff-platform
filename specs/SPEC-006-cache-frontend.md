# SPEC-006 — Cache do Frontend e Integridade de Chunks

## Metadados

| Campo        | Valor                                                       |
| ------------ | ----------------------------------------------------------- |
| ID           | SPEC-006                                                    |
| Autor        | Agente (Spec Author)                                        |
| Status       | Aprovada                                                    |
| Data         | 2026-11-02                                                  |
| Aprovação    | Elessandro em 2026-11-02 (solicitação direta de correção)   |
| Relacionados | SPEC-004, TASK-010, TASK-011, TASK-012                      |

## 1. Contexto

O frontend Angular é publicado como arquivos com hash no nome
(`main-*.js`, `chunk-*.js`). O `index.html` referencia esses hashes e, portanto,
muda a cada build. O Nginx não definia política explícita para o HTML: o
`index.html` era servido apenas com `Last-Modified`/`ETag`, sujeito a cache
heurístico do navegador.

Após um novo deploy, um navegador com `index.html` antigo em cache continuou
tentando carregar chunks que já não existiam no servidor, resultando em:

```
GET /chunk-CzhWRLvO.js 404 (Not Found)
TypeError: Failed to fetch dynamically imported module
```

O erro impedia o carregamento das rotas lazy e, por consequência, o login com
JWT não avançava. Além disso, o `location` de assets definia `add_header`, o que
interrompe a herança dos headers de segurança do nível `server` (por exemplo,
`X-Content-Type-Options: nosniff` deixava de ser enviado em JS/CSS).

## 2. Objetivo

Definir uma política de cache explícita e segura para o frontend:

- `index.html` e rotas SPA sempre revalidados, sem servir shell antigo;
- assets com hash cacheáveis por longo prazo como `immutable`;
- headers de segurança preservados em todas as respostas.

## 3. Escopo

- `apps/frontend-angular/nginx.conf`:
  - `map $uri` para classificar assets vs. HTML/API;
  - `Cache-Control` no nível `server` (com herança preservada);
  - remoção de `expires`/`add_header Cache-Control` do `location` de assets.
- Validação por `curl -I` e navegador limpo.
- Documentação SDD (`SPEC-006`, `TASK-012`, `PROJECT.md`, `CHANGELOG.md`,
  `reviews/REV-003-TASK-012.md`).

## 4. Não-objetivos

- Alterar CSP, lógica da aplicação, rotas, componentes ou contratos.
- Introduzir service worker, version endpoint ou mecanismo de reload forçado.
- Alterar cache do BFF, do worker ou de outros serviços.
- Mudar o pipeline de build do Angular.

## 5. Comportamento esperado

1. `GET /` e `GET /index.html` respondem `Cache-Control: no-store`.
2. Rotas SPA (`/dashboard`, `/acordos`, etc.) também respondem `no-store`, pois
   entregam o shell.
3. Assets com hash respondem
   `Cache-Control: public, max-age=31536000, immutable`.
4. `X-Content-Type-Options`, CSP e demais headers de segurança continuam
   presentes em HTML e assets.
5. Após rebuild + recreate do container, uma sessão nova carrega login,
   dashboard e listagem sem 404 de chunks.

## 6. Critérios de aceite

- [x] `index.html` e rotas SPA com `Cache-Control: no-store`.
- [x] Assets JS/CSS com `Cache-Control: public, max-age=31536000, immutable`.
- [x] `X-Content-Type-Options: nosniff` presente em HTML e JS.
- [x] Login com JWT e navegação para dashboard/listagem sem erro de chunk.
- [x] Gates `lint test build` verdes.

## 7. Interfaces e dados

Sem alteração de contratos, DTOs, endpoints ou eventos. Mudança restrita ao
servidor estático do frontend.

## 8. Requisitos não-funcionais

- **Segurança**: headers de segurança preservados em todas as respostas.
- **Confiabilidade**: deploy não deixa abas antigas presas a chunks removidos.
- **Performance**: assets continuam imutáveis por 1 ano; apenas o HTML é
  revalidado.
- **Operação**: política declarativa no Nginx, sem dependência de código da
  aplicação.

## 9. Riscos

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
| `no-store` no HTML desabilita bfcache em alguns navegadores | Baixo | Shell é leve; recarregamento é aceitável para evitar chunks órfãos |
| `no-store` também é aplicado a respostas do BFF via `/api/` | Baixo | Dados autenticados não devem ser cacheados por padrão |
| Cache antigo já presente no navegador do usuário | Baixo | Após o deploy, uma revalidação/recarga única corrige; `no-store` evita recorrência |

## 10. Perguntas abertas

_Nenhuma._

## 11. Aprovação

| Nome       | Papel                     | Data       | Decisão  |
| ---------- | ------------------------- | ---------- | -------- |
| Elessandro | Product Owner / Tech Lead | 2026-11-02 | Aprovado |
