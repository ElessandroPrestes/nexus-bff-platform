# SPEC-005 — Redesign Premium do Frontend (Console de Operações)

## Metadados

| Campo        | Valor                                              |
| ------------ | -------------------------------------------------- |
| ID           | SPEC-005                                           |
| Autor        | Agente (Spec Author)                               |
| Status       | Aprovada                                           |
| Data         | 2026-11-01                                         |
| Aprovação    | Elessandro (2026-11-01)                            |
| Relacionados | SPEC-003, TASK-009, TASK-010, D-002, D-009         |

## 1. Contexto

A TASK-009 entregou um frontend funcional com Tailwind, dark mode e acessibilidade
básica. A TASK-010 corrigiu a violação de CSP. O resultado atual é um CRUD
administrativo limpo, porém genérico: falta identidade de produto, hierarquia de
informação, densidade útil e microinterações. O objetivo desta SPEC é elevar a
interface ao padrão de produto B2B premium, sem alterar contratos de backend.

## 2. Objetivo

Transformar o frontend em um **console de operações** com shell de navegação,
visão geral com KPIs, listagem filtrável, formulário guiado e login com
identidade de marca, mantendo WCAG 2.1 AA, dark mode e performance.

## 3. Escopo

### P0 — correções de UX

1. **Input monetário com máscara BRL** no formulário, armazenando centavos
   internamente. Exibe `R$ 1.250,00`; submete `125000`.
2. **Semântica de status**: `INADIMPLENTE` = perigo (vermelho/âmbar),
   `CANCELADO` = neutro (cinza), `PENDENTE` = atenção, `ATIVO` = informação,
   `CONCLUIDO` = sucesso.
3. **Ações de linha**: menu acessível (kebab) com “Ver detalhes” e “Remover”.
   Remoção via **modal com focus trap** (Escape fecha, foco retorna ao gatilho),
   substituindo `window.confirm`.
4. **Header ciente da rota**: não exibir o CTA “Entrar” na rota `/login`.
5. **Números e datas**: valores monetários alinhados à direita com
   `tabular-nums`; vencimento atrasado destacado em `danger`.

### P1 — experiência premium

6. **App shell**: sidebar no desktop (Visão geral, Acordos) + topbar com busca
   global, tema e menu de usuário; no mobile, drawer de navegação.
7. **Visão geral (dashboard)**: 4 KPIs calculados da listagem atual — total em
   aberto, inadimplência, concluídos e ticket médio — com empty state próprio.
8. **Toolbar da listagem**: busca textual, filtro por status, ordenação e
   paginação client-side; contador de resultados e limpar filtros.
9. **Formulário guiado**: seções (“Dados do acordo”, “Partes”, “Pagamento”),
   labels humanos para enums, validação on blur e barra de ações sticky.
10. **Login premium**: split-screen com painel de marca no desktop e card no
    mobile; campo de token monoespaçado com “Colar”/mostrar, ajuda contextual e
    estado de loading.
11. **Estados e feedback**: skeletons no carregamento, empty states com CTA,
    toasts com ícone e barra de progresso.

## 4. Não-objetivos

- Alterar BFF, DTOs, endpoints, schema ou regras de negócio.
- Paginação/filtro server-side (a listagem atual retorna tudo).
- Combobox de devedor/credor por nome (depende de API de clientes — D-002).
- Fluxo de edição de acordo (fica para SPEC-006).
- Novas seções de navegação além de Visão geral e Acordos.
- Biblioteca de gráficos, i18n ou fonte customizada self-hosted.
- Alterar CSP ou configuração de infraestrutura.

## 5. Comportamento esperado

### 5.1 Shell
- `lg+`: sidebar fixa de 256 px, topbar sticky, conteúdo com largura máxima.
- `<lg`: topbar compacta com botão de menu; drawer com overlay, focus trap e
  fechamento por Escape/overlay.
- Item ativo com `aria-current="page"` e contraste AA.

### 5.2 Visão geral
- KPIs: “Em aberto” (soma de PENDENTE + ATIVO + INADIMPLENTE), “Inadimplência”
  (soma INADIMPLENTE), “Concluídos” (soma CONCLUIDO), “Ticket médio” (média de
  todos os acordos).
- Valores em BRL; estado de carregando com skeletons; erro com retry.

### 5.3 Listagem
- Busca por descrição/devedor/credor; filtro por status; ordenação por
  vencimento/valor/descrição; paginação de 10 itens.
- Toolbar sticky abaixo do título; contador “X de Y acordos”.
- Menu de ações por linha acessível por teclado (`Enter`/`Space`/`Esc`).
- Modal de remoção com título, descrição, “Cancelar” e “Remover” (danger).

### 5.4 Formulário
- Seções com `fieldset`/`legend` visuais e semânticos.
- Valor com máscara BRL; data com locale `pt-BR`.
- Validação on blur + resumo de erros no submit; `aria-invalid`/`aria-describedby`.
- Barra de ações sticky no rodapé do formulário.

### 5.5 Login
- Desktop: painel esquerdo com marca, tagline e detalhe visual; formulário à
  direita. Mobile: card centralizado.
- Token: `font-mono`, botão “Colar” (Clipboard API com fallback), toggle
  mostrar/ocultar, link “Como obter meu token?” (texto informativo, sem link
  externo).
- Botão com estado de loading e `aria-busy`.

### 5.6 Movimento
- Transições de 150–200 ms; respeitar `prefers-reduced-motion`.

## 6. Critérios de aceite

- [ ] Input monetário exibe BRL e submete centavos corretamente (teste unitário).
- [ ] Cores de status seguem o mapeamento semântico aprovado (teste unitário).
- [ ] Menu de ações abre por teclado; modal prende foco, fecha com Escape e
      restaura o foco; remoção chama a API (teste unitário).
- [ ] Header não mostra “Entrar” em `/login` (teste unitário).
- [ ] Valores monetários à direita e com `tabular-nums`.
- [ ] Sidebar/drawer com navegação acessível e item ativo correto.
- [ ] Dashboard calcula os 4 KPIs a partir dos acordos (teste unitário).
- [ ] Toolbar filtra, ordena e pagina client-side (teste unitário).
- [ ] Formulário em seções, validação on blur e ações sticky.
- [ ] Login split-screen no desktop e card no mobile.
- [ ] Skeletons, empty states e toasts com ícone.
- [ ] Dark mode com paridade em todas as telas.
- [ ] WCAG 2.1 AA: teclado, foco visível, contraste, `aria-live`.
- [ ] `pnpm nx run-many -t lint test build --exclude=nexus-core` verde.

## 7. Interfaces e dados

Sem alteração de contratos. Dashboard e filtros usam `GET /api/v1/acordos`;
detalhe usa `GET /api/v1/acordos/:id`; remoção usa `DELETE /api/v1/acordos/:id`.
Nenhum endpoint novo.

## 8. Requisitos não-funcionais

- **Sem novas dependências de runtime** para máscara, modal ou gráficos.
- **Performance**: bundle inicial estável; filtros/paginação em memória.
- **Acessibilidade**: foco gerenciado em modal/drawer; alvos ≥ 44 px.
- **Manutenibilidade**: componentes de UI reutilizáveis em `core/ui/`.

## 9. Riscos

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
| Escopo P0+P1 grande para uma entrega | Médio | TASK-011 dividida em etapas verificáveis |
| Focus trap/modal com bugs de teclado | Médio | Testes unitários e revisão de a11y |
| Filtro client-side não escalar | Baixo | Documentado como dívida até paginação server-side |
| Regressão visual no dark mode | Baixo | Tokens semânticos e verificação nas duas themes |

## 10. Perguntas abertas

1. **Combobox de devedor/credor**: depende de API de clientes (D-002).
   Recomendação: manter inputs melhorados nesta SPEC e abrir SPEC própria.
2. **Editar acordo**: recomendação: adiar para SPEC-006 (evita duplicar o
   formulário sem um fluxo de detalhe/edit definido).
3. **Seções da sidebar**: recomendação: apenas Visão geral e Acordos agora.
4. **Fonte customizada**: recomendação: manter system UI stack (CSP `font-src
   'self'` e sem adicionar assets binários).

## 11. Aprovação

| Nome | Papel | Data | Decisão |
| --- | --- | --- | --- |
| Elessandro | Product Owner / Tech Lead | 2026-11-01 | Aprovado |
