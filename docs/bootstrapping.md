# Bootstrapping de Novos Projetos

Este projeto já foi inicializado com o Universal SDD. Para aplicar o framework a outro projeto:

## 1. Copie a estrutura

Copie os arquivos de framework (não o código de produto):

```
README.md PROJECT.md AGENTS.md CLAUDE.md GEMINI.md COPILOT.md
UNIVERSAL_SDD_FRAMEWORK.md CONTRIBUTING.md CHANGELOG.md ROADMAP.md CODE_OF_CONDUCT.md
agents/ workflows/ profiles/ knowledge/ standards/ templates/ specs/ tasks/ reviews/ adr/ docs/
```

## 2. Gere o `PROJECT.md`

Solicite à IA que analise o repositório e identifique arquitetura, stack e padrões. Registre o estado canônico.

## 3. Preencha a base de conhecimento

Ver `docs/knowledge-base.md`.

## 4. Defina os padrões

Ajuste `standards/ux-ui.md`, `standards/design-system.md`, `standards/accessibility.md`, `standards/testing.md` e `standards/quality-gates.md` ao contexto.

## 5. Aguarde aprovação

Nenhuma implementação de interface antes de discovery, design e SPEC aprovados.

## 6. Configure automação

Adicione lint, testes e CI que materializem os quality gates.
