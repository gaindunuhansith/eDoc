# eDoc simple Kubernetes setup

This is a minimal full-stack Kubernetes setup for local development.

## Prerequisites

- Kubernetes cluster (Docker Desktop, minikube, or kind)
- Images built and available as:
  - `edoc/api-gateway:latest`
  - `edoc/user-service:latest`
  - `edoc/patient-service:latest`
  - `edoc/doctor-service:latest`
  - `edoc/appointment-service:latest`
  - `edoc/payment-service:latest`
  - `edoc/notification-service:latest`
  - `edoc/telemedicine-service:latest`
  - `edoc/feedback-service:latest`
  - `edoc/ai-service:latest`
  - `edoc/frontend:latest`

## Apply

```bash
kubectl apply -f k8s/edoc-simple.yaml
```

## Access

- Frontend: `http://localhost:30030`
- API Gateway: `http://localhost:30080`

## Notes

- This is intentionally simple and uses `emptyDir` for database storage.
- For durable data, replace DB Deployments with StatefulSets and PVCs.
- Update `edoc-secrets` values before real usage.
