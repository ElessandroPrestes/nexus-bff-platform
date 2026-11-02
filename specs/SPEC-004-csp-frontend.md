# SPEC-004 — CSP do Frontend e Inlining de CSS Crítico

## Metadados

| Campo        | Valor                                              |
| ------------ | -------------------------------------------------- |
| ID           | SPEC-004                                           |
| Autor        | Agente (Spec Author)                               |
| Status       | Aprovada                                           |
| Data         | 2026-11-01                                         |
| Aprovação    | Elessandro em 2026-11-01                           |
| Relacionados | SPEC-001 (Fase 6), ADR-0003, ADR-0004, TASK-010    |

## 1. Contexto

O frontend é servido por Nginx com uma Content Security Policy restritiva:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

O build de produção do Angular (`@angular/build`) habilita por padrão o
`beasties`, que extrai o CSS crítico e injeta um `<script>` inline no
`index.html` para trocar o `media` da folha de estilos:

```html
<script>
  document.querySelectorAll('link[data-beasties-media]').forEach(function (l) {
    l.media = l.getAttribute('data-beasties-media');
    l.removeAttribute('data-beasties-media');
  });
</script>
```

Com `script-src 'self'`, o navegador bloqueia esse script. Como a folha de
estilos é emitida com `media="print"`, o bloqueio impede a troca para `all` e a
página é renderizada **sem estilos**. O console reporta violação de CSP com o
hash `sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM=`.

## 2. Objetivo

Eliminar a violação de CSP e restaurar a renderização correta do frontend
**sem enfraquecer a política de segurança**.

## 3. Escopo

- Desabilitar o inlining de CSS crítico no build de produção do
  `apps/frontend-angular` (`optimization.styles.inlineCritical = false`).
- Adicionar verificação automatizada no CI de que o `index.html` gerado não
  contém scripts inline.
- Registrar a decisão em ADR-0004 e atualizar a documentação de estado.

## 4. Não-objetivos

- Alterar a diretiva `script-src` do Nginx (não adicionar `'unsafe-inline'` nem
  hash).
- Alterar lógica, rotas, componentes ou estilos da aplicação.
- Introduzir nonce dinâmico por request.
- Alterar o CSP do BFF.

## 5. Comportamento esperado

1. O build de produção emite `index.html` sem `<script>` inline.
2. A folha de estilos é referenciada normalmente (`<link rel="stylesheet">`),
   sem o par `media="print"` + script de troca.
3. A CSP do Nginx permanece inalterada e restritiva.
4. A aplicação carrega com estilos aplicados em `http://localhost:5216`.

## 6. Critérios de aceite

- [ ] `pnpm nx build frontend-angular` gera `index.html` sem scripts inline.
- [ ] `apps/frontend-angular/nginx.conf` mantém `script-src 'self'`.
- [ ] O CI falha se um script inline reaparecer no `index.html` de produção.
- [ ] `pnpm nx run-many -t lint test build --exclude=nexus-core` verde.
- [ ] Verificação manual no navegador sem violação de CSP e com estilos.

## 7. Interfaces e dados

Sem alteração de contratos, DTOs, endpoints ou eventos. Mudança restrita ao
pipeline de build e à verificação de CI.

## 8. Requisitos não-funcionais

- **Segurança**: CSP mantém `script-src 'self'`; nenhuma flexibilização.
- **Performance**: perde-se o inlining do CSS crítico; o bundle CSS é pequeno
  (~5 kB gzip), então o impacto no first paint é desprezível.
- **Manutenibilidade**: a solução não depende de hash frágil a upgrades do
  Angular.

## 9. Riscos

| Risco | Impacto | Mitigação |
| ----- | ------- | --------- |
| Pequeno atraso no first paint por CSS não inline | Baixo | Bundle CSS ~5 kB gzip; aceitável |
| Regressão futura reintroduzir inlining | Médio | Verificação automatizada no CI |

## 10. Perguntas abertas

_Nenhuma — abordagem escolhida pelo Product Owner/Tech Lead em 2026-11-01._

## 11. Aprovação

| Nome       | Papel                     | Data       | Decisão  |
| ---------- | ------------------------- | ---------- | -------- |
| Elessandro | Product Owner / Tech Lead | 2026-11-01 | Aprovado |

Abordagem aprovada: **desativar o CSS crítico inline**, mantendo o CSP estrito.
