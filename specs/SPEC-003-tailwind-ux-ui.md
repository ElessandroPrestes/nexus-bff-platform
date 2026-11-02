# SPEC-003 — Tailwind CSS + Redesign UX/UI do Frontend Angular

## Metadados

| Campo        | Valor                                          |
| ------------ | ---------------------------------------------- |
| ID           | SPEC-003                                       |
| Autor        | Agente (Spec Author)                           |
| Status       | Aprovada                                       |
| Data         | 2026-11-01                                     |
| Aprovação    | Elessandro em 2026-11-01                       |
| Relacionados | SPEC-001 (Fase 5), D-009, TASK-009, ADR-0003   |

## 1. Contexto

O frontend foi entregue na Fase 5 da SPEC-001 com CSS customizado e tokens
provisórios (exceção G2 registrada como D-009). A UI funciona mas carece de
consistência visual, hierarquia clara e polimento profissional.

Tailwind CSS v4 é a escolha para o design system por:
- Utilidades atômicas eliminam CSS morto e nomeação ad hoc.
- Integração nativa com Angular 22 via `@angular/build` (vite + postcss).
- Tokens de design (cores, espaçamento, tipografia) centralizados em `styles.scss`.
- Dark mode via seletor `[data-theme='dark']` (compatível com `ThemeService` existente).

## 2. Objetivo

Substituir todo o CSS customizado do frontend por **Tailwind CSS v4**, aplicando
boas práticas de UX/UI: hierarquia tipográfica, espaçamento consistente, feedback
visual de estados, acessibilidade AA e dark mode funcional.

## 3. Escopo

### Arquivos a modificar

```
apps/frontend-angular/src/styles.scss          # Remove CSS custom; importa Tailwind + tokens
apps/frontend-angular/src/app/app.html         # Shell: header, nav, main, skip link
apps/frontend-angular/src/app/app.scss         # Remove CSS custom restante

apps/frontend-angular/src/app/features/auth/login/login.ts
apps/frontend-angular/src/app/features/acordos/acordos-list/acordos-list.ts
apps/frontend-angular/src/app/features/acordos/acordo-form/acordo-form.ts
apps/frontend-angular/src/app/core/notifications/notification-list.ts
```

### Arquivos a criar

```
apps/frontend-angular/tailwind.config.js       # Config Tailwind v4 (content paths)
```

### Arquivos fora de escopo

- Lógica TypeScript dos componentes (sem alteração).
- Serviços, interceptors, guards (sem alteração).
- Testes de lógica (podem precisar de ajuste de seletores).
- `libs/common/`, `apps/api-bff/`, `apps/ms-cobranca/` (sem alteração).

## 4. Não-objetivos

- Criar um design system completo com storybook.
- Adicionar animações complexas além de transições simples.
- Alterar rotas, guards ou lógica de negócio.
- Internacionalização (i18n).

## 5. Comportamento esperado (Design System)

### 5.1 Paleta de cores (tokens Tailwind via CSS custom properties)

| Token               | Light                  | Dark                   | Uso                          |
| ------------------- | ---------------------- | ---------------------- | ---------------------------- |
| `--color-brand`     | `#1d4ed8` (blue-700)   | `#60a5fa` (blue-400)   | CTAs, links, foco            |
| `--color-surface`   | `#ffffff`              | `#1e293b` (slate-800)  | Cards, inputs                |
| `--color-bg`        | `#f1f5f9` (slate-100)  | `#0f172a` (slate-900)  | Fundo da página              |
| `--color-text`      | `#0f172a` (slate-900)  | `#f1f5f9` (slate-100)  | Texto principal              |
| `--color-muted`     | `#64748b` (slate-500)  | `#94a3b8` (slate-400)  | Texto secundário             |
| `--color-border`    | `#e2e8f0` (slate-200)  | `#334155` (slate-700)  | Bordas                       |
| `--color-danger`    | `#dc2626` (red-600)    | `#f87171` (red-400)    | Erros, botão de remoção      |
| `--color-success`   | `#16a34a` (green-600)  | `#4ade80` (green-400)  | Notificações de sucesso      |

### 5.2 Tipografia

- Font stack: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- `h1`: `text-2xl font-bold` (páginas internas), `text-3xl font-bold` (login)
- `h2`/labels: `text-sm font-semibold uppercase tracking-wide text-muted`
- Corpo: `text-sm` (tabelas, formulários), `text-base` (parágrafos)

### 5.3 Componentes de UI

#### Header / Nav Shell (`app.html`)
```
<header>: bg-surface border-b border-border shadow-sm sticky top-0 z-30
  Logo "N" + "Nexus": símbolo com bg-brand text-white rounded-lg
  Nav links: hover:text-brand, active: text-brand font-semibold
  Botão tema: ícone ☀/🌙, border border-border rounded-lg
  Botão sair: text-muted hover:text-danger
<main>: container mx-auto px-4 py-8 max-w-6xl
```

#### Login (`login.ts`)
```
Layout centralizado: min-h-screen flex items-center justify-center bg-bg
Card: bg-surface rounded-2xl shadow-lg border border-border p-8 max-w-md w-full
Logo grande no topo do card
Input textarea: border border-border rounded-xl focus:ring-2 focus:ring-brand
Botão Entrar: w-full bg-brand text-white rounded-xl py-3 font-semibold
```

#### Lista de Acordos (`acordos-list.ts`)
```
Header da página: flex justify-between items-center mb-6
Botão "Novo acordo": bg-brand text-white rounded-xl px-4 py-2
Tabela em desktop: rounded-2xl overflow-hidden border border-border
  Cabeçalho: bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase
  Linhas: hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
Badges de status: cores semânticas
  PENDENTE: yellow, ATIVO: blue, CONCLUIDO: green, CANCELADO: red, SUSPENSO: gray
Cards em mobile: cada linha vira card com grid de 2 colunas
Estado vazio / erro / loading: centralizado com ícone SVG inline
```

#### Formulário de Acordo (`acordo-form.ts`)
```
Grid de campos: grid grid-cols-1 md:grid-cols-2 gap-6
Label: block text-sm font-medium text-text mb-1
Input/Select: w-full rounded-xl border border-border bg-surface px-3 py-2.5
  focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
  aria-invalid: border-danger focus:ring-danger
Mensagem de erro: text-xs text-danger mt-1 font-medium
Ações: flex gap-3 mt-8 flex-wrap
Botão salvar: bg-brand text-white flex-1 sm:flex-none
Botão cancelar: border border-border
```

#### Notificações (`notification-list.ts`)
```
Posição: fixed bottom-4 right-4 z-50 flex flex-col gap-2
Toast: rounded-xl shadow-lg border p-4 flex items-start gap-3
  sucesso: border-success/30 bg-success/10 text-success
  erro: border-danger/30 bg-danger/10 text-danger
  informacao: border-brand/30 bg-brand/10 text-brand
Botão fechar: ml-auto text-current opacity-60 hover:opacity-100
```

### 5.4 Acessibilidade (mantida)

- Skip link funcional (posição absoluta, visível no foco).
- `aria-invalid`, `aria-describedby`, `aria-live`, `role="alert"` mantidos.
- `focus-visible` com `ring-2 ring-brand` (contraste AA).
- `prefers-reduced-motion`: `motion-reduce:transition-none` nas classes.

### 5.5 Dark mode

- Mecanismo: `[data-theme='dark']` no `<html>` (compatível com `ThemeService`).
- Tailwind v4 usa `variant` `[data-theme='dark'] &` via CSS nesting.
- Alternativa: configurar `darkMode: ['selector', '[data-theme="dark"]']`.

## 6. Critérios de aceite

- [ ] Tailwind v4 instalado e gerando CSS no build Angular.
- [ ] `styles.scss` importa Tailwind e define apenas tokens globais (sem classes custom redundantes).
- [ ] `app.html` reescrito com classes Tailwind — header sticky, nav funcional, dark mode.
- [ ] `LoginComponent` redesenhado: card centralizado, textarea estilizada, botão primário.
- [ ] `AcordosListComponent` redesenhado: tabela responsiva, badges coloridos por status.
- [ ] `AcordoFormComponent` redesenhado: grid de campos, labels semânticos, estados de erro visíveis.
- [ ] `NotificationList` redesenhado: toasts com cores semânticas.
- [ ] Dark mode funcional via `[data-theme='dark']`.
- [ ] Acessibilidade WCAG 2.1 AA mantida (skip link, aria, foco visível).
- [ ] `pnpm nx run-many -t lint test build` verde (sem regressão).

## 7. Interfaces e dados

Sem alteração em contratos, DTOs ou APIs. Mudança exclusivamente na camada de apresentação.

## 8. Requisitos não-funcionais

- **Performance**: Tailwind v4 purga classes não utilizadas no build de produção — bundle CSS ≤ 20 kB.
- **Compatibilidade**: Angular 22 + `@angular/build` (vite). Tailwind v4 é compatível nativamente.
- **Manutenibilidade**: sem CSS custom ad hoc nos componentes — apenas utilitários Tailwind.
- **Acessibilidade**: manter WCAG 2.1 AA (contraste mínimo 4.5:1 em texto normal).

## 9. Riscos

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
| Tailwind v4 API diferente de v3 | Médio | Verificar docs v4; usar `@import "tailwindcss"` em vez de `@tailwind` |
| Budget Angular ultrapassado (CSS) | Baixo | Purge automático do build; ajustar budget se necessário |
| Testes falham por seletores CSS mudados | Baixo | Testes usam seletores de elementos e texto, não classes CSS |

## 10. Perguntas abertas

_Nenhuma — design aprovado nesta SPEC._

## 11. Aprovação

| Nome       | Papel                     | Data       | Decisão  |
| ---------- | ------------------------- | ---------- | -------- |
| Elessandro | Product Owner / Tech Lead | 2026-11-01 | Aprovado |
