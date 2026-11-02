# CHANGELOG

Todas as mudanças notáveis deste projeto são registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Bootstrap do framework Universal SDD.
- Documentação base (`README.md`, `PROJECT.md`, `AGENTS.md`, `UNIVERSAL_SDD_FRAMEWORK.md`).
- Adaptadores por provedor (`CLAUDE.md`, `GEMINI.md`, `COPILOT.md`).
- Módulos de `docs/`, `standards/`, `agents/`, `workflows/`, `templates/`.
- Tailwind CSS v4 no frontend, com tokens semânticos e dark mode (TASK-009).
- Verificação no CI contra scripts inline no `index.html` do frontend (TASK-010).
- App shell com sidebar/topbar, busca global, menu de usuário e drawer mobile (TASK-011).
- Dashboard `/dashboard` com KPIs de valores em aberto, inadimplência, concluídos e ticket médio (TASK-011).
- Componentes de UI reutilizáveis: `modal` com focus trap, `drawer`, `skeleton`, `status-badge`, `kpi-card` e `currency-input` BRL (TASK-011).
- Toolbar de listagem com busca, filtro por status, ordenação, paginação e contador; menu de ações e drawer de detalhe (TASK-011).
- Formulário em seções com máscara monetária, labels humanos e barra de ações sticky (TASK-011).
- Login split-screen com token monoespaçado, “Colar”, alternância de visibilidade e estado de loading (TASK-011).
- Toasts com ícone e barra de progresso; skeletons e empty states (TASK-011).

### Changed
- Remoção de acordo passou de `window.confirm` para modal acessível com foco gerenciado (TASK-011).
- Números monetários da listagem alinhados à direita com `tabular-nums`; vencimento atrasado destacado em `danger` (TASK-011).

### Fixed
- Violação de CSP no frontend causada pelo script inline de CSS crítico do
  beasties; build agora usa `inlineCritical: false` e mantém `script-src 'self'`
  (SPEC-004, ADR-0004, TASK-010).
- 404 de chunks e falha de import dinâmico após deploy: `index.html` e rotas
  SPA agora usam `Cache-Control: no-store` e assets com hash usam
  `immutable`; headers de segurança passam a ser herdados em JS/CSS
  (SPEC-006, TASK-012).

## [0.1.0] - 2026-10-29

### Added
- Estrutura inicial do projeto Nexus BFF Platform.
