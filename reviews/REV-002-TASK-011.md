# Review — TASK-011

## Metadados

| Campo      | Valor                          |
| ---------- | ------------------------------ |
| ID         | REV-002                        |
| Tipo       | Code Review                    |
| Referência | SPEC-005 / TASK-011            |
| Revisor    | Agente (auto-revisão)          |
| Data       | 2026-11-02                     |

## Checklist

- [x] Aderência à SPEC.
- [x] Standards aplicáveis.
- [x] Testes e evidências.
- [x] Acessibilidade (interface).
- [x] Segurança.
- [x] Documentação/`PROJECT.md`.

## Evidências

- Gates: `pnpm nx run-many -t lint test build --exclude=nexus-core` → 12/12 tarefas verdes.
- Frontend: 14 arquivos de teste, 51 testes passando.
- Build de produção servido pelo Nginx com CSP `script-src 'self'`; console do navegador sem erros.
- QA visual em 1440×900 e 390×844, temas claro e escuro:
  `/tmp/opencode/shots/01-login.png` a `12-busca-global.png`.
- Busca global validada: `/acordos?q=Zeta` retorna 1 linha.
- Vencimento atrasado validado por `getComputedStyle` → `rgb(220, 38, 38)` (danger).
- Modal de remoção validado com foco inicial, Escape e restauração de foco (teste unitário).

## Achados

| ID   | Severidade | Descrição | Ação |
| ---- | ---------- | --------- | ---- |
| A-01 | Baixa      | Detalhe do acordo faz uma chamada `GET /:id` adicional mesmo já tendo o DTO na listagem | Aceito: a SPEC-005 define o uso de `GET /:id`; cache pode ser avaliado em evolução |
| A-02 | Baixa      | Filtros/paginação são client-side e não escalam para grandes volumes | Dívida registrada na SPEC; sem impacto no escopo atual |

## Parecer

Aprovado com ressalvas.

O redesign entrega os itens P0 e P1 da SPEC-005, mantém contratos de backend,
não adiciona dependências de runtime e preserva CSP, dark mode e WCAG 2.1 AA
nas telas alteradas. Falta a validação formal por revisor humano (D-013).
