# Arquitetura

## Visão

O Universal SDD é independente de arquitetura. A arquitetura do Nexus BFF Platform será definida por ADRs em `adr/` e registrada em `PROJECT.md`.

## Camadas conceituais (proposta, sujeita a ADR)

```
Cliente (frontend)
      │
      ▼
BFF (contratos, agregação, adaptação)
      │
      ▼
Serviços de backend / APIs de domínio
```

> Esta é uma candidata arquitetural, **não** uma decisão aprovada. Requer ADR.

## Decisões pendentes

| ID | Decisão | Status |
| --- | --- | --- |
| D-001 | Linguagem e framework | Pendente |
| D-002 | Estratégia de agregação e cache | Pendente |
| D-003 | Contratos (REST/GraphQL/gRPC) | Pendente |
| D-004 | Observabilidade | Pendente |

## Como registrar decisões

1. Copie `templates/adr.md` para `adr/ADR-<numero>-<slug>.md`.
2. Descreva contexto, decisão, alternativas e consequências.
3. Obtenha aprovação.
4. Atualize `PROJECT.md`.
