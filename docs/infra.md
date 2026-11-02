# Infraestrutura — Nexus Core

Operação local com Docker Compose e implantação em Kubernetes.

## 1. Portas locais

| Serviço           | Host | Container |
| ----------------- | ---- | --------- |
| Frontend (Nginx)  | 5216 | 8080      |
| BFF (health/API)  | 3200 | 3000      |
| MongoDB           | 5401 | 27017     |
| RabbitMQ (AMQP)   | 8200 | 5672      |
| RabbitMQ (gestão) | 8202 | 15672     |
| Redis             | 8201 | 6379      |
| Worker (health)   | —    | 3201      |

Domínios locais no Caddy: `http://nexus.localhost` (frontend) e
`http://nexus-api.localhost` (BFF).

## 2. Docker Compose

```bash
cp .env.example .env
# ajuste segredos e portas se necessário
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Acessos:

- Frontend: http://localhost:5216
- API: http://localhost:3200/api
- RabbitMQ: http://localhost:8202 (usuário/senha do `.env`)

Encerrar e remover volumes:

```bash
docker compose down
docker compose down -v
```

O frontend usa Nginx sem root, com SPA fallback, proxy `/api` para `bff:3000`,
headers de segurança e endpoint `/healthz`. BFF e worker rodam como usuário
`10001`, com filesystem raiz somente leitura.

## 3. Imagens

| Aplicação | Dockerfile                         | Imagem de referência                       |
| --------- | ---------------------------------- | ------------------------------------------ |
| BFF       | `apps/api-bff/Dockerfile`          | `ghcr.io/<owner>/<repo>/api-bff:<tag>`     |
| Worker    | `apps/ms-cobranca/Dockerfile`      | `ghcr.io/<owner>/<repo>/ms-cobranca:<tag>` |
| Frontend  | `apps/frontend-angular/Dockerfile` | `ghcr.io/<owner>/<repo>/frontend:<tag>`    |

Build local:

```bash
docker build -f apps/api-bff/Dockerfile -t nexus/api-bff:local .
docker build -f apps/ms-cobranca/Dockerfile -t nexus/ms-cobranca:local .
docker build -f apps/frontend-angular/Dockerfile -t nexus/frontend:local .
```

As imagens Node instalam apenas dependências de produção a partir do lock gerado
pelo alvo `prune` do Nx.

## 4. Kubernetes

Os manifestos ficam em `k8s/` e são agnósticos de cluster. Ajuste antes de aplicar:

1. Imagens `ghcr.io/nexus-core/*` para o registry real.
2. `k8s/configmap.yaml`: `CORS_ORIGIN` e URLs internas.
3. `k8s/secret.yaml`: substitua `REPLACE_ME` por secrets reais ou use
   External Secrets/Sealed Secrets/Vault.
4. `k8s/ingress.yaml`: host e `secretName` do TLS.

```bash
kubectl apply -k k8s
kubectl -n nexus get deploy,svc,ingress,hpa
kubectl -n nexus rollout status deploy/bff
```

Recursos incluídos:

- Deployments com probes de startup/readiness/liveness, requests/limits e
  `securityContext` restrito (non-root, seccomp `RuntimeDefault`, rootfs read-only).
- Services `bff`, `worker` e `frontend`.
- ConfigMap e Secret.
- Ingress com `/api` → BFF e `/` → frontend.
- HPA por CPU para BFF, worker e frontend.
- Namespace com Pod Security Admission `restricted`.

Dependências de estado (MongoDB, Redis, RabbitMQ) são externas ao cluster neste
escopo; use operadores ou serviços gerenciados. O Secret aponta para os hosts
internos de exemplo e deve ser ajustado.

## 5. CI/CD

`.github/workflows/ci.yml` executa:

1. Lint, testes e build dos projetos Nx.
2. Build das três imagens Docker (todas as execuções) e push para GHCR em push
   para `develop`/`main` (registry provisório — D-004).
3. Validação dos manifestos com `kubeconform` e do Compose com
   `docker compose config`.

## 6. Riscos e pendências

- Registry definitivo ainda não decidido (D-004); GHCR é provisório.
- Não há cluster Kubernetes neste ambiente; validação é estática (`kubeconform`).
- TLS/domínio reais dependem do ambiente de destino.
- Segredos de exemplo não podem ir para produção.
