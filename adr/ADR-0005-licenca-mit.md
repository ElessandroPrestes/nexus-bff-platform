# ADR-0005 — Licença MIT

## Metadados

| Campo     | Valor                 |
| --------- | --------------------- |
| ID        | ADR-0005              |
| Status    | Aceito                |
| Data      | 2026-11-02            |
| Aprovação | Elessandro em 2026-11-02 |

## Contexto

O projeto estava sem licença definida (`UNLICENSED` no `package.json` e D-003 em
`PROJECT.md`), o que bloqueava release público e tornava ambíguos os direitos de
uso, cópia e contribuição. O repositório é um monorepo TypeScript com BFF
NestJS, worker e frontend Angular, aberto a contribuições.

## Decisão

Adotar a licença **MIT**, com copyright de **Elessandro Prestes**, a partir de
2026. A licença é aplicada via arquivo `LICENSE` na raiz e pelo campo
`"license": "MIT"` no `package.json`.

## Alternativas consideradas

| Alternativa | Prós | Contras |
| ----------- | ---- | ------- |
| MIT (escolhida) | Simples, permissiva, amplamente adotada no ecossistema JS/TS | Não concede patentes explicitamente |
| Apache-2.0 | Concessão explícita de patentes; proteção de marca | Texto mais longo e maior carga de compliance |
| AGPL-3.0 | Garante abertura de derivados oferecidos como serviço | Restritiva para adoção comercial |
| GPL-3.0 | Copyleft forte | Exige abertura de derivados distribuídos |

## Consequências

- Uso, modificação, distribuição e uso comercial são permitidos, desde que o
  aviso de copyright e a permissão sejam mantidos.
- O software é fornecido sem garantias.
- Contribuições passam a ser licenciadas sob os mesmos termos.
- D-003 é resolvido; o projeto pode ser publicado como open source.

## Relacionados

D-003, `PROJECT.md`, `README.md`, `LICENSE`.
