# ADR-0002 — Stack e Versões

## Metadados

| Campo | Valor |
| --- | --- |
| ID | ADR-0002 |
| Status | Aceito |
| Data | 2026-10-29 |
| Aprovação | Elessandro em 2026-10-29 |

## Contexto

É preciso fixar a stack do monorepo. O ambiente disponibiliza versões recentes; versões precisam ser pinadas para builds reprodutíveis.

## Decisão

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Runtime | Node.js | 24.x |
| Package manager | pnpm | 9.x |
| Monorepo | Nx | 24.x |
| Linguagem | TypeScript | 7.x |
| Frontend | Angular | 22.x (standalone, signals) |
| Backend/BFF | NestJS | 12.x |
| Worker | NestJS microservices | 12.x |
| Mensageria | RabbitMQ | 3.x |
| Banco | MongoDB | 7.x |
| Cache | Redis | 7.x |
| Servidor estático | Nginx | 1.27.x |
| Testes back | Jest + Supertest | — |
| Testes front | Vitest (ou Jasmine/Karma) | — |

## Alternativas consideradas

| Alternativa | Prós | Contras |
| --- | --- | --- |
| Versões LTS anteriores | Estabilidade | Perde recursos modernos (signals) |
| Últimas versões (escolhida) | Recursos atuais | Risco de APIs recentes |

## Consequências

- Recursos modernos de Angular (signals, standalone) e Nest 12.
- Necessidade de ajustar geradores/APIs conforme versões.
- Dependências pinadas no `package.json`/lockfile.

## Relacionados

SPEC-001, ADR-0001.
