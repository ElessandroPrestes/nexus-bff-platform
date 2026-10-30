# ADR-0003 — Baseline de Segurança (OWASP)

## Metadados

| Campo | Valor |
| --- | --- |
| ID | ADR-0003 |
| Status | Aceito |
| Data | 2026-10-29 |
| Aprovação | Elessandro em 2026-10-29 |

## Contexto

O sistema é corporativo e exposto ao cliente. Precisamos de controles de segurança desde o bootstrap.

## Decisão

Aplicar os seguintes controles no BFF:

| OWASP | Controle | Implementação |
| --- | --- | --- |
| A01 Broken Access Control | Autenticação e autorização | `JwtAuthGuard` + `RolesGuard` |
| A03 Injection | Validação de entrada | `ValidationPipe` global + DTOs `class-validator` |
| A04 Insecure Design | Rate limiting | `@nestjs/throttler` |
| A05 Security Misconfiguration | Headers seguros | `helmet` |
| A09 Logging Insecure | Log estruturado/auditoria | `LoggingInterceptor` |

Complementos:

- Segredos via variáveis de ambiente / K8s Secrets.
- CORS restritivo por ambiente.
- JWT com expiração curta e claims mínimos.
- Nenhum segredo versionado.

## Alternativas consideradas

| Alternativa | Prós | Contras |
| --- | --- | --- |
| Controles manuais | Simples | Propenso a erro |
| Middleware dedicado (escolhido) | Padrão NestJS, testável | Dependências extras |

## Consequências

- Segurança padronizada e auditável.
- Guards/interceptors precisam de testes.
- Configuração sensível por ambiente.

## Relacionados

SPEC-001, TASK-001.
