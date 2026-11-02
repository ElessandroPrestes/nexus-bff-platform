# TASK-006 — Fase 6: Docker, Kubernetes e CI/CD

## Metadados

| Campo          | Valor                       |
| -------------- | --------------------------- |
| ID             | TASK-006                    |
| SPEC           | SPEC-001 (seção 5 — Fase 6) |
| Autor          | Agente                      |
| Status         | Concluída                   |
| Prioridade     | Alta                        |
| Depende de     | TASK-005 (concluída)        |
| Data de início | 2026-10-31                  |
| Data de conclusão | 2026-10-31               |

## 1. Descrição

Empacotar e operar o Nexus Core:

- Dockerfiles multi-stage para `api-bff`, `ms-cobranca` e `frontend-angular`
  (frontend servido por Nginx).
- `docker-compose.yml` com MongoDB, Redis, RabbitMQ e as três aplicações.
- Manifestos Kubernetes em `k8s/`: Namespace, ConfigMap, Secret, Deployments,
  Services, Ingress, HPA e probes.
- GitHub Actions: lint/test/build existentes + build de imagens, publicação em
  GHCR (provisória) e validação de manifestos com `kubeconform`.
- Documentação de operação em `docs/infra.md`.

## 2. Escopo

### Arquivos a criar

```
.dockerignore
docker-compose.yml
apps/api-bff/Dockerfile
apps/ms-cobranca/Dockerfile
apps/frontend-angular/Dockerfile
apps/frontend-angular/nginx.conf
k8s/namespace.yaml
k8s/configmap.yaml
k8s/secret.yaml
k8s/bff.yaml
k8s/worker.yaml
k8s/frontend.yaml
k8s/ingress.yaml
k8s/hpa.yaml
k8s/kustomization.yaml
docs/infra.md
```

### Arquivos a modificar

- `.github/workflows/ci.yml` — jobs `imagens` e `manifestos`.
- `.env.example` — variáveis de Compose (Mongo, RabbitMQ, portas).
- `PROJECT.md` — estado canônico e dívidas.
- `tasks/TASK-006-phase6-infra.md` — este documento.

## 3. Fora de escopo

- Provisionamento de cluster Kubernetes real (D-004).
- Registry definitivo de imagens (GHCR usado provisoriamente).
- TLS/domínio reais; Ingress usa host e secret de exemplo.
- Observabilidade centralizada (Prometheus/Grafana) e service mesh.

## 4. Decisões

| Decisão                                                                        | Justificativa                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Imagens Node `node:24-alpine`, Nginx `nginxinc/nginx-unprivileged:1.27-alpine` | Stack da ADR-0002; Nginx sem root.                                   |
| Runtime instala dependências a partir do lock gerado pelo Nx (`prune`)         | Imagem enxuta e reprodutível, sem devDependencies.                   |
| GHCR (`ghcr.io/<owner>/<repo>/<app>`)                                          | Registry padrão do GitHub; D-004 permanece para registry definitivo. |
| `kubeconform` no CI                                                            | Validação offline, sem cluster.                                      |
| Segredos via `.env`/Secret com placeholders                                    | Nunca comitar valores reais (AGENTS §2.9).                           |
| Portas locais registradas no `PORTS.md`                                        | Front 5216, API 3200, Mongo 5401, RabbitMQ 8200/8202, Redis 8201.    |

## 5. Passos

1. ✅ Redigir este documento.
2. ✅ Criar `.dockerignore` e Dockerfiles multi-stage.
3. ✅ Criar `nginx.conf` do frontend (SPA, proxy `/api`, headers e health).
4. ✅ Criar `docker-compose.yml` com dependências e healthchecks.
5. ✅ Criar manifestos K8s (Deployments, Services, ConfigMap, Secret, Ingress, HPA, probes).
6. ✅ Atualizar CI com build de imagens, publicação GHCR e validação de manifestos.
7. ✅ Documentar operação em `docs/infra.md`.
8. ✅ Validar Compose, K8s e builds de imagem; atualizar `PROJECT.md`.

## 6. Definition of Done

- [x] Dockerfiles multi-stage funcionando para as três aplicações.
- [x] `docker compose config` válido e stack definido (Mongo, Redis, RabbitMQ, apps).
- [x] Manifestos K8s válidos com probes, resources, HPA e Ingress.
- [x] CI com lint/test/build, build de imagens e validação de manifestos.
- [x] Evidências registradas.
- [x] `PROJECT.md` atualizado.

## 7. Evidências

### Gate G1 — Docker Compose

```
$ docker compose config --quiet
EXIT: 0
```

Compose válido; 6 serviços definidos: `mongo`, `redis`, `rabbitmq`, `bff`, `worker`, `frontend`.

### Gate G2 — Manifestos Kubernetes (kubeconform v0.6.7)

```
$ kubeconform -strict -summary -ignore-missing-schemas k8s/
Summary: 14 resources found in 9 files - Valid: 13, Invalid: 0, Errors: 0, Skipped: 1
EXIT: 0
```

O recurso ignorado (`Skipped: 1`) é o `Secret` (`k8s/secret.yaml`), cujo schema não é distribuído pelo repositório de schemas do Kubernetes (CRD privado). Todos os demais recursos passaram na validação estrita.

### Gate G3 — Lint / Test / Build (pnpm nx run-many)

| Target | Projetos | Resultado |
| ------ | -------- | --------- |
| lint   | common, api-bff, ms-cobranca, frontend-angular | 4/4 ✅ |
| test   | common (30), api-bff (18), ms-cobranca (14), frontend-angular (25) | 87/87 ✅ |
| build  | common, api-bff, ms-cobranca, frontend-angular | 4/4 ✅ |

Data de execução: 2026-10-31.
