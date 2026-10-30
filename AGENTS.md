# AGENTS.md — Protocolo Comum para Pessoas e Agentes de IA

Este é o protocolo que **toda pessoa e todo agente de IA** deve seguir neste repositório, independentemente do provedor (ChatGPT, Codex, Claude Code, Gemini, Copilot, Cursor, Windsurf, Aider, etc.).

## 1. Ordem de leitura obrigatória

Antes de qualquer ação, leia nesta ordem:

1. `PROJECT.md` — estado canônico do projeto.
2. `UNIVERSAL_SDD_FRAMEWORK.md` — definição normativa do núcleo.
3. Este `AGENTS.md` — protocolo.
4. A SPEC e a TASK relevantes em `specs/` e `tasks/`.
5. Os `standards/` aplicáveis à mudança.

## 2. Regras invioláveis

1. **Sem SPEC, sem implementação.** Toda implementação começa por uma SPEC aprovada.
2. **Sem aprovação humana, sem SPEC.** A IA pode redigir, nunca aprovar.
3. **Implemente apenas o escopo aprovado.** Não invente requisitos nem expanda escopo.
4. **Interfaces exigem discovery e design aprovados** antes de codar.
5. **Respeite os quality gates** em `standards/quality-gates.md`.
6. **Mudanças arquiteturais geram ADR** em `adr/`.
7. **Atualize `PROJECT.md`** quando o estado canônico mudar.
8. **Não resolva divergências silenciosamente.** Registre como defeito, mudança de escopo ou dívida documental.
9. **Nunca comite segredos.** Use variáveis de ambiente e arquivos ignorados.
10. **Deixe evidências.** Testes, logs e resultados de QA devem ser rastreáveis.

## 3. Fluxo de trabalho do agente

```
1. Entender o pedido e localizar a SPEC/TASK correspondente
2. Verificar se há aprovação humana
3. Planejar a mudança (menor escopo possível)
4. Implementar
5. Testar e coletar evidências
6. Atualizar documentação e PROJECT.md
7. Solicitar review (design e/ou código)
8. Registrar resultado em reviews/
```

## 4. Limites

- Não altere a SPEC aprovada sem abrir uma revisão de escopo.
- Não altere arquivos fora do escopo da TASK.
- Não introduza dependências novas sem justificativa e aprovação.
- Não faça refatorações amplas não solicitadas.
- Não faça commit, push ou PR sem pedido explícito.

## 5. Quando faltar informação

- **Pare e pergunte.** Registre a lacuna como pendência em `PROJECT.md` ou como pergunta aberta na SPEC.
- Não preencha lacunas com suposições silenciosas.

## 6. Adaptadores por provedor

Os arquivos `CLAUDE.md`, `GEMINI.md` e `COPILOT.md` apontam para este protocolo. Nenhum adaptador pode contradizer este documento.

## 7. Definition of Done (resumo)

Uma TASK está concluída quando:

- o comportamento aprovado está implementado;
- os testes aplicáveis passam;
- os quality gates aplicáveis foram satisfeitos;
- a documentação e o `PROJECT.md` estão atualizados;
- as evidências de QA estão registradas;
- o review foi concluído.
