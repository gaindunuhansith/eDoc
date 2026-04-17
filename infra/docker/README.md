# Docker Artifacts

This folder contains helper Docker Compose snippets aligned with the Kubernetes manifests in infra/k8s.

- snippets live in infra/docker/services
- each snippet includes an app service and a matching postgres db service

Run a snippet:

```bash
cd infra/docker/services
docker compose -f <service>.compose.yaml up -d
```

These snippets are for local development only.

