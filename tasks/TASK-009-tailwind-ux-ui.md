# TASK-009 — Tailwind CSS + Redesign UX/UI do Frontend Angular

## Metadados

| Campo          | Valor                    |
| -------------- | ------------------------ |
| ID             | TASK-009                 |
| SPEC           | SPEC-003                 |
| Autor          | Agente                   |
| Status         | **Concluída**            |
| Prioridade     | Alta                     |
| Depende de     | TASK-008 (concluída)     |
| Data de início | 2026-11-01               |
| Data de conclusão | 2026-11-01            |

## 1. Descrição

Instalar Tailwind CSS v4 no `apps/frontend-angular` e redesenhar todos os
componentes de apresentação seguindo o design system aprovado na SPEC-003.
Substituição total do CSS customizado por utilitários Tailwind.

## 2. Escopo

### Arquivos a criar
```
apps/frontend-angular/tailwind.config.js
apps/frontend-angular/.postcssrc.json          # integração Tailwind v4 via @tailwindcss/postcss
```

### Arquivos a modificar
```
apps/frontend-angular/src/styles.scss
apps/frontend-angular/src/app/app.scss
apps/frontend-angular/src/app/app.html
apps/frontend-angular/src/app/features/auth/login/login.ts
apps/frontend-angular/src/app/features/acordos/acordos-list/acordos-list.ts
apps/frontend-angular/src/app/features/acordos/acordo-form/acordo-form.ts
apps/frontend-angular/src/app/core/notifications/notification-list.ts
package.json                                # adiciona tailwindcss v4
tasks/TASK-009-tailwind-ux-ui.md            # DoD + Evidências ao final
PROJECT.md
```

### Fora de escopo
- Lógica TypeScript dos componentes.
- Serviços, interceptors, guards, testes de lógica.
- `libs/`, `apps/api-bff/`, `apps/ms-cobranca/`.

## 3. Passos

1. ✅ Redigir SPEC-003.
2. ✅ Registrar aprovação da SPEC-003.
3. ✅ Redigir esta TASK.
4. ✅ Instalar `tailwindcss` v4 e criar `tailwind.config.js`.
5. ✅ Reescrever `styles.scss`: Tailwind + tokens CSS custom.
6. ✅ Redesenhar `app.html` (header/nav/layout shell).
7. ✅ Redesenhar `LoginComponent`.
8. ✅ Redesenhar `AcordosListComponent`.
9. ✅ Redesenhar `AcordoFormComponent`.
10. ✅ Redesenhar `NotificationList`.
11. ✅ Verificar testes (25/25 mantidos sem ajuste de seletores).
12. ✅ Rodar lint + test + build; registrar evidências.
13. ✅ Atualizar este documento (DoD + Evidências) e `PROJECT.md`.

### Notas de implementação

- O builder `@angular/build` não consome `@tailwindcss/vite`; a integração
  suportada é PostCSS. Foi adicionado `.postcssrc.json` com
  `@tailwindcss/postcss` (dependência `@tailwindcss/postcss@4`), e o
  `@tailwindcss/vite` foi removido por não ter uso.
- `styles.scss` usa `@use 'tailwindcss'` em vez de `@import` para evitar o
  warning de depreciação do Dart Sass; o CSS gerado é idêntico.
- O enum real de status é `PENDENTE | ATIVO | CONCLUIDO | CANCELADO | INADIMPLENTE`;
  a SPEC-003 citava `SUSPENSO` por engano. O badge cinza foi aplicado a
  `INADIMPLENTE`.
- `NotFoundComponent` também foi migrado para Tailwind (usava classes removidas
  de `styles.scss`), sem alteração de lógica.

## 4. Definition of Done

- [x] Tailwind v4 instalado e gerando CSS no build de produção.
- [x] `styles.scss` sem CSS custom redundante — apenas tokens e Tailwind.
- [x] Todos os componentes redesenhados com Tailwind.
- [x] Dark mode funcional via `[data-theme='dark']`.
- [x] WCAG 2.1 AA mantido (skip link, aria, contraste, foco visível).
- [x] `pnpm nx run-many -t lint test build` verde sem regressão.
- [x] D-009 marcado como resolvido no `PROJECT.md`.

## 5. Evidências

| Verificação | Resultado |
| ----------- | --------- |
| Build de produção (`frontend-angular:build`) | ✅ `styles.css` 27.14 kB raw / 5.08 kB transfer; Tailwind gerando utilitários |
| Testes unitários do frontend | ✅ 25/25 (9 arquivos) |
| Lint | ✅ sem erros (warnings remanescentes são do `api-bff`, pré-existentes) |
| Gates globais `lint test build` | ✅ 4/4 projetos |
| Dark mode | ✅ tokens semânticos alternam por `[data-theme='dark']` + variant `dark:` |
| Acessibilidade | ✅ skip link, `aria-live`, `aria-invalid`, `role=alert`, foco visível mantidos |

Comando executado:

```
pnpm nx run-many -t lint test build --exclude=nexus-core
```
