# TASK-011 — Redesign Premium do Frontend (P0 + P1)

## Metadados

| Campo          | Valor                    |
| -------------- | ------------------------ |
| ID             | TASK-011                 |
| SPEC           | SPEC-005                 |
| Autor          | Agente                   |
| Status         | Concluída                |
| Prioridade     | Alta                     |
| Depende de     | TASK-010 (concluída)     |
| Data de início | 2026-11-01               |

## 1. Descrição

Implementar o redesign premium aprovado na SPEC-005, cobrindo correções P0 e a
experiência P1, sem alterar backend nem contratos.

## 2. Escopo

### Arquivos a criar

```
apps/frontend-angular/src/app/core/ui/
  modal.ts                      # modal acessível com focus trap
  drawer.ts                     # drawer mobile reutilizável
  skeleton.ts                   # skeleton de carregamento
  currency-input.ts             # input monetário BRL (centavos internos)
  status-badge.ts               # badge semântico por StatusAcordo
  kpi-card.ts                   # card de KPI do dashboard

apps/frontend-angular/src/app/features/dashboard/
  dashboard.ts                  # visão geral com 4 KPIs
  dashboard.spec.ts

apps/frontend-angular/src/app/features/acordos/acordos-list/
  acordos-toolbar.ts            # busca, filtro, ordenação
  acordo-actions-menu.ts        # menu de ações por linha
  acordo-detail-drawer.ts       # detalhe via GET /:id
```

### Arquivos a modificar

```
apps/frontend-angular/src/app/app.html
apps/frontend-angular/src/app/app.ts
apps/frontend-angular/src/app/app.routes.ts
apps/frontend-angular/src/app/app.scss
apps/frontend-angular/src/app/features/auth/login/login.ts
apps/frontend-angular/src/app/features/acordos/acordos-list/acordos-list.ts
apps/frontend-angular/src/app/features/acordos/acordo-form/acordo-form.ts
apps/frontend-angular/src/app/core/notifications/notification-list.ts
apps/frontend-angular/src/styles.scss
```

### Fora de escopo

- Backend, DTOs, endpoints e schema.
- Combobox de devedor/credor por nome (D-002).
- Fluxo de edição (SPEC-006).
- Novas dependências de runtime.

## 3. Dependências

- SPEC-005 aprovada (G3).
- Design aprovado (G2) coberto pela SPEC-005.

## 4. Passos

1. Criar componentes de UI base: `modal`, `drawer`, `skeleton`, `status-badge`,
   `kpi-card`, `currency-input`.
2. Refatorar `acordos-list` para usar `status-badge`, `acordo-actions-menu`,
   `acordo-detail-drawer`, toolbar de busca/filtro/ordenação e paginação.
3. Substituir `window.confirm` por `modal` de remoção com focus trap.
4. Criar dashboard com KPIs calculados da listagem e rota `/dashboard`.
5. Implementar app shell (sidebar/topbar/drawer) e atualizar `app.html`/rotas.
6. Refatorar formulário em seções, com `currency-input`, validação on blur e
   barra sticky.
7. Redesenhar login split-screen com token monoespaçado, “Colar” e loading.
8. Polir toasts, skeletons e empty states.
9. Ajustar/expandir testes unitários.
10. Rodar gates e registrar evidências; atualizar `PROJECT.md` e `CHANGELOG.md`.

## 5. Testes

- [x] `currency-input`: formata BRL e emite centavos.
- [x] `status-badge`: mapeia os 5 status para as cores aprovadas.
- [x] `modal`: abre, prende foco, fecha com Escape e restaura foco.
- [x] `acordo-actions-menu`: navegação por teclado e emissão de ações.
- [x] `acordos-list`: busca, filtro, ordenação e paginação.
- [x] `dashboard`: cálculo dos 4 KPIs.
- [x] `app`: header sem “Entrar” em `/login`; item ativo da navegação.
- [x] `acordo-form`: máscara monetária, seções e validação on blur.
- [x] `login`: “Colar”, toggle de visibilidade e loading.
- [x] Gates: `pnpm nx run-many -t lint test build --exclude=nexus-core`.

## 6. Plano de Teste

| Nível | Ferramenta | Cobertura |
| ----- | ---------- | --------- |
| Unitário | Vitest (Angular) | Componentes de UI, filtros, KPIs, formatação |
| Integração | TestBed | Listagem + toolbar + modal |
| Manual | Navegador | Desktop/mobile, claro/escuro, teclado |
| A11y | Manual + testes de foco | Modal, drawer, menu, contraste |

## 7. Evidências

- Gates: `pnpm nx run-many -t lint test build --exclude=nexus-core` → 12/12 tarefas verdes.
- Frontend: 14 arquivos de teste, 51 testes passando.
- Build de produção (`frontend-angular:build:production`) servido por Nginx com CSP `script-src 'self'`.
- QA visual (Playwright + Chrome) em desktop 1440×900 e mobile 390×844, temas claro/escuro:
  `01-login.png` a `12-busca-global.png` em `/tmp/opencode/shots/`.
- Sem erros de console/página nas rotas `/login`, `/dashboard`, `/acordos` e `/acordos/novo`.
- Busca global (`/acordos?q=Zeta`) e destaque de vencimento atrasado validados no navegador.
- Review: `reviews/REV-002-TASK-011.md` (validação humana pendente em D-013).

## 8. Definition of Done

- [x] Comportamento aprovado na SPEC-005 implementado.
- [x] Testes novos e existentes passam.
- [x] Quality gates G5 satisfeitos (lint/test/build + evidências).
- [x] WCAG 2.1 AA validada nas telas alteradas.
- [x] `PROJECT.md` e `CHANGELOG.md` atualizados.
- [x] Review registrado em `reviews/`.
