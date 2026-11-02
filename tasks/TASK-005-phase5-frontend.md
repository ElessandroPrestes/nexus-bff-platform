# TASK-005 — Fase 5: Frontend Angular (standalone, signals, a11y)

## Metadados

| Campo          | Valor                       |
| -------------- | --------------------------- |
| ID             | TASK-005                    |
| SPEC           | SPEC-001 (seção 5 — Fase 5) |
| Autor          | Agente                      |
| Status         | Concluída                   |
| Prioridade     | Alta                        |
| Depende de     | TASK-004 (concluída)        |
| Data de início | 2026-10-31                  |

## 0. Exceção de gate (G2) — design de UX

O `ROADMAP.md` mantém “Design aprovado” pendente e `standards/ux-ui.md` bloqueia
implementação de interface sem design aprovado. Para dar continuidade ao programa,
foi autorizada uma **UI provisória** com estes limites:

| Campo       | Valor                                                  |
| ----------- | ------------------------------------------------------ |
| Gate        | G2 — Design de UX                                      |
| Exceção     | UI provisória, sem identidade visual definitiva        |
| Autorização | Elessandro (solicitação de continuidade em 2026-10-31) |
| Dono        | Produto/UX                                             |
| Prazo       | Revisar e substituir quando o design for aprovado      |
| Registro    | Este documento + `PROJECT.md` (D-009)                  |

Tokens visuais usados aqui são neutros e provisórios. Não constituem o design
system oficial e devem ser revisados no gate de design.

## 1. Descrição

Implementar a SPA `apps/frontend-angular` com Angular 22 standalone:

- Componentes standalone e rotas lazy.
- Signals + RxJS (estado local e chamadas HTTP).
- `authInterceptor` (Bearer JWT) e tratamento global de erros HTTP.
- Tema claro/escuro persistido e respeito a `prefers-reduced-motion`.
- Layout responsivo, navegação por teclado, foco visível e WCAG 2.2 AA.
- Fluxo mínimo de Acordos: autenticação por token, listagem e criação.
- Estados de vazio, carregando, erro e sucesso nas telas.

## 2. Escopo

### Arquivos a criar

```
apps/frontend-angular/proxy.conf.json
apps/frontend-angular/src/app/
├── core/
│   ├── api/
│   │   ├── api.config.ts
│   │   └── acordos-api.service.ts
│   ├── auth/
│   │   ├── auth.guard.ts
│   │   ├── auth.interceptor.ts
│   │   └── auth.service.ts
│   ├── errors/
│   │   └── error.interceptor.ts
│   ├── notifications/
│   │   ├── notification.service.ts
│   │   └── notification-list.ts
│   └── theme/
│       └── theme.service.ts
├── features/
│   ├── acordos/
│   │   ├── acordos.routes.ts
│   │   ├── acordos-list/acordos-list.ts
│   │   └── acordo-form/acordo-form.ts
│   ├── auth/login/login.ts
│   └── not-found/not-found.ts
└── app.routes.ts / app.config.ts / app.ts / app.html / app.scss / app.spec.ts
```

### Arquivos a modificar

- `apps/frontend-angular/src/index.html` — idioma, título e metadados.
- `apps/frontend-angular/src/styles.scss` — tokens provisórios, foco, motion, utilitários.
- `apps/frontend-angular/project.json` — proxy de desenvolvimento para o BFF.
- `PROJECT.md` — estado canônico e dívidas (D-009).

### Arquivos a remover

- `apps/frontend-angular/src/app/nx-welcome.ts` — scaffold substituído (D-005).

## 3. Fora de escopo

- Design system definitivo e identidade visual (bloqueado por G2).
- Telas de edição/detalhe de Acordo e administração.
- Autenticação real via OAuth/OIDC (D-004); o login apenas armazena um JWT fornecido.
- E2E e testes de acessibilidade automatizados (Fase 7).

## 4. Dependências

Nenhuma dependência nova. Usa `@angular/common/http`, `@angular/forms`,
`@angular/router`, `rxjs` e tipos puros de `@nexus/common` (import `type`).

## 5. Passos

1. ✅ Redigir este documento e registrar a exceção G2.
2. ✅ Criar tokens e utilitários globais acessíveis.
3. ✅ Criar `AuthService`, `authInterceptor` e `authGuard`.
4. ✅ Criar `ThemeService` e `NotificationService`.
5. ✅ Criar `AcordosApiService` e `errorInterceptor`.
6. ✅ Criar shell (`App`), login, lista, formulário e 404 com rotas lazy.
7. ✅ Configurar `app.config.ts` e proxy do BFF.
8. ✅ Testes unitários dos serviços, interceptors e componentes críticos.
9. ✅ Lint + test + build verdes; `PROJECT.md` atualizado.

## 6. Decisões

- **Contrato**: `@nexus/common` é importado apenas como `type` para não levar
  `class-validator`/`class-transformer` ao bundle do browser.
- **Auth**: token JWT em `localStorage` (provisório; D-004 decide o provedor).
- **Erros**: interceptor global classifica 401/403/404/422/5xx e publica
  notificações acessíveis; componentes também exibem estado de erro local.
- **Tema**: `data-theme` no `<html>`, persistência em `localStorage` e fallback
  para `prefers-color-scheme`.
- **Acessibilidade**: skip link, foco visível, labels explícitos, `aria-live`,
  tabela com `caption`/`scope`, contraste AA e `prefers-reduced-motion`.

## 7. Definition of Done

- [x] Standalone + rotas lazy + signals/RxJS aplicados.
- [x] Interceptor JWT e tratamento global de erros funcionando.
- [x] Tema claro/escuro e layout responsivo.
- [x] Fluxos de login, listagem e criação de Acordo com estados vazio/carregando/erro/sucesso.
- [x] Checklist de acessibilidade atendido (teclado, foco, labels, contraste, motion).
- [x] Testes unitários passando.
- [x] `nx run-many -t lint test build` verde (sem regressão).
- [x] `PROJECT.md` atualizado e evidências registradas.

## 8. Evidências

> Execução dos quality gates em 2026-10-31.

### Testes (2026-10-31)

```
> nx run frontend-angular:test

Test Files: 9 passed (9)
Tests:      25 passed (25)
Duration:   ~6s
```

Cobertura funcional: `AuthService`, `authInterceptor`, `errorInterceptor`,
`ThemeService`, `AcordosApiService`, shell (`App`), login, lista e formulário.

### Lint (2026-10-31)

```
> nx run frontend-angular:lint
> eslint .

0 errors, 0 warnings
```

### Build de produção (2026-10-31)

```
Initial total      292.95 kB raw | 80.85 kB transfer
styles.css           5.33 kB raw |  1.50 kB transfer

Lazy chunks: acordo-form (6.58 kB), acordos-list (3.90 kB),
login (2.11 kB), not-found (668 B), acordos-routes (275 B)

Application bundle generation complete.
```

O scaffold `nx-welcome.ts` foi removido; o warning de budget **D-005** deixou de
existir. Nenhum aviso de budget no build de produção.

### run-many lint+test+build (2026-10-31)

```
NX  Running targets lint, test, build for 5 projects
NX  Successfully ran targets lint, test, build for 5 projects
```

Sem regressão nos projetos existentes (`api-bff`, `ms-cobranca`, `common`).

### Acessibilidade (checklist manual)

- Skip link para `#conteudo`; `main` recebe foco.
- Foco visível global (`:focus-visible`) e ordem de foco natural.
- Labels explícitos em todos os campos; erros ligados por `aria-describedby` e
  `aria-invalid`.
- Tabela com `caption` (visualmente oculta) e `th scope="col"`.
- Notificações em região `aria-live`; erros com `role="alert"`.
- Botão de tema com `aria-pressed` e rótulo dinâmico.
- Contraste conferido nos tokens claro/escuro (AA) e `prefers-reduced-motion`
  respeitado.
- Layout responsivo: tabela vira cartões abaixo de 40rem.
