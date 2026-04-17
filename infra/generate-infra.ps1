$ErrorActionPreference = 'Stop'
Set-Location "$PSScriptRoot/.."

$services = @(
  @{ Name='api-gateway'; Port=8080; DbName='api_gateway_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8080' },
      @{ Name='USER_SERVICE_URL'; ConfigKey='USER_SERVICE_URL' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' },
      @{ Name='APPOINTMENT_SERVICE_URL'; ConfigKey='APPOINTMENT_SERVICE_URL' },
      @{ Name='PAYMENT_SERVICE_URL'; ConfigKey='PAYMENT_SERVICE_URL' },
      @{ Name='NOTIFICATION_SERVICE_URL'; ConfigKey='NOTIFICATION_SERVICE_URL' },
      @{ Name='TELEMEDICINE_SERVICE_URL'; ConfigKey='TELEMEDICINE_SERVICE_URL' },
      @{ Name='FEEDBACK_SERVICE_URL'; ConfigKey='FEEDBACK_SERVICE_URL' },
      @{ Name='AI_SERVICE_URL'; ConfigKey='AI_SERVICE_URL' },
      @{ Name='CORS_ALLOWED_ORIGIN_1'; ConfigKey='CORS_ALLOWED_ORIGIN_1' },
      @{ Name='CORS_ALLOWED_ORIGIN_2'; ConfigKey='CORS_ALLOWED_ORIGIN_2' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' }
    ) },
  @{ Name='ai-service'; Port=8090; DbName='ai_service_db'; Env=@(
      @{ Name='PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='GROQ_API_KEY'; SecretKey='GROQ_API_KEY' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' }
    ) },
  @{ Name='appointment-service'; Port=8081; DbName='appointment_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8081' },
      @{ Name='DB_HOST'; Value='appointment-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='appointment_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' },
      @{ Name='NOTIFICATION_SERVICE_URL'; ConfigKey='NOTIFICATION_SERVICE_URL' }
    ) },
  @{ Name='doctor-service'; Port=8082; DbName='doctor_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8082' },
      @{ Name='DB_HOST'; Value='doctor-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='doctor_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' }
    ) },
  @{ Name='feedback-service'; Port=8089; DbName='feedback_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8089' },
      @{ Name='DB_HOST'; Value='feedback-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='feedback_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='APPOINTMENT_SERVICE_URL'; ConfigKey='APPOINTMENT_SERVICE_URL' },
      @{ Name='NOTIFICATION_SERVICE_URL'; ConfigKey='NOTIFICATION_SERVICE_URL' },
      @{ Name='USER_SERVICE_URL'; ConfigKey='USER_SERVICE_URL' }
    ) },
  @{ Name='notification-service'; Port=8083; DbName='notification_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8083' },
      @{ Name='DB_HOST'; Value='notification-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='notification_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' },
      @{ Name='USER_SERVICE_URL'; ConfigKey='USER_SERVICE_URL' },
      @{ Name='RESEND_API_KEY'; SecretKey='RESEND_API_KEY' },
      @{ Name='VONAGE_API_KEY'; SecretKey='VONAGE_API_KEY' },
      @{ Name='VONAGE_API_SECRET'; SecretKey='VONAGE_API_SECRET' }
    ) },
  @{ Name='patient-service'; Port=8084; DbName='patient_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8084' },
      @{ Name='DB_HOST'; Value='patient-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='patient_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='REPORTS_DIR'; Value='/app/uploads/reports' }
    ) },
  @{ Name='payment-service'; Port=8085; DbName='payment_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8085' },
      @{ Name='DB_HOST'; Value='payment-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='payment_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='APPOINTMENT_SERVICE_BASE_URL'; ConfigKey='APPOINTMENT_SERVICE_BASE_URL' },
      @{ Name='NOTIFICATION_SERVICE_BASE_URL'; ConfigKey='NOTIFICATION_SERVICE_BASE_URL' },
      @{ Name='API_GATEWAY_ORIGIN'; ConfigKey='API_GATEWAY_ORIGIN' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='PAYHERE_MERCHANT_ID'; SecretKey='PAYHERE_MERCHANT_ID' },
      @{ Name='PAYHERE_MERCHANT_SECRET'; SecretKey='PAYHERE_MERCHANT_SECRET' }
    ) },
  @{ Name='telemedicine-service'; Port=8086; DbName='telemedicine_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8086' },
      @{ Name='DB_HOST'; Value='telemedicine-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='telemedicine_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='APPOINTMENT_SERVICE_URL'; ConfigKey='APPOINTMENT_SERVICE_URL' },
      @{ Name='NOTIFICATION_SERVICE_URL'; ConfigKey='NOTIFICATION_SERVICE_URL' },
      @{ Name='USER_SERVICE_URL'; ConfigKey='USER_SERVICE_URL' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='TWILIO_ACCOUNT_SID'; SecretKey='TWILIO_ACCOUNT_SID' },
      @{ Name='TWILIO_AUTH_TOKEN'; SecretKey='TWILIO_AUTH_TOKEN' },
      @{ Name='TWILIO_API_KEY_SID'; SecretKey='TWILIO_API_KEY_SID' },
      @{ Name='TWILIO_API_SECRET'; SecretKey='TWILIO_API_SECRET' }
    ) },
  @{ Name='user-service'; Port=8088; DbName='user_db'; Env=@(
      @{ Name='SERVER_PORT'; Value='8088' },
      @{ Name='DB_HOST'; Value='user-service-db' },
      @{ Name='DB_PORT'; Value='5432' },
      @{ Name='DB_NAME'; Value='user_db' },
      @{ Name='DB_USER'; SecretKey='DB_USER' },
      @{ Name='DB_PASSWORD'; SecretKey='DB_PASSWORD' },
      @{ Name='JWT_PRIVATE_KEY_PATH'; SecretKey='JWT_PRIVATE_KEY_PATH' },
      @{ Name='JWT_PUBLIC_KEY_PATH'; SecretKey='JWT_PUBLIC_KEY_PATH' },
      @{ Name='PATIENT_SERVICE_URL'; ConfigKey='PATIENT_SERVICE_URL' },
      @{ Name='DOCTOR_SERVICE_URL'; ConfigKey='DOCTOR_SERVICE_URL' }
    ) }
)

New-Item -ItemType Directory -Path 'infra/docker/services' -Force | Out-Null
New-Item -ItemType Directory -Path 'infra/k8s' -Force | Out-Null

$dockerReadme = @'
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
'@
Set-Content -Path 'infra/docker/README.md' -Value $dockerReadme -Encoding utf8

foreach ($svc in $services) {
  $name = $svc.Name
  $svcDir = "infra/k8s/$name"
  New-Item -ItemType Directory -Path $svcDir -Force | Out-Null

  $dbConfig = @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: $name-db-config
  namespace: edoc
data:
  DB_HOST: $name-db
  DB_PORT: "5432"
  DB_NAME: $($svc.DbName)
"@
  Set-Content -Path "$svcDir/$name-db-config.yaml" -Value $dbConfig -Encoding utf8

  $dbInit = @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: $name-db-init-sql
  namespace: edoc
data:
  init.sql: |
    CREATE SCHEMA IF NOT EXISTS app;
---
apiVersion: batch/v1
kind: Job
metadata:
  name: $name-db-init
  namespace: edoc
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: init-db
          image: postgres:16-alpine
          env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: edoc-secrets
                  key: DB_PASSWORD
          command: ["/bin/sh", "-c"]
          args:
            - psql -h $name-db -U user -d $($svc.DbName) -f /init/init.sql
          volumeMounts:
            - name: init-sql
              mountPath: /init
      volumes:
        - name: init-sql
          configMap:
            name: $name-db-init-sql
"@
  Set-Content -Path "$svcDir/$name-db-init.yaml" -Value $dbInit -Encoding utf8

  $envYaml = ''
  foreach ($env in $svc.Env) {
    if ($env.ContainsKey('Value')) {
      $envYaml += "`n            - name: $($env.Name)`n              value: `"$($env.Value)`""
    } elseif ($env.ContainsKey('ConfigKey')) {
      $envYaml += "`n            - name: $($env.Name)`n              valueFrom:`n                configMapKeyRef:`n                  name: edoc-config`n                  key: $($env.ConfigKey)"
    } elseif ($env.ContainsKey('SecretKey')) {
      $envYaml += "`n            - name: $($env.Name)`n              valueFrom:`n                secretKeyRef:`n                  name: edoc-secrets`n                  key: $($env.SecretKey)"
    }
  }

  $serviceType = if ($name -eq 'api-gateway') { 'NodePort' } else { 'ClusterIP' }
  $nodePort = if ($name -eq 'api-gateway') { "`n      nodePort: 30080" } else { '' }

  $deploy = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $name
  namespace: edoc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: $name
  template:
    metadata:
      labels:
        app: $name
    spec:
      containers:
        - name: $name
          image: edoc/${name}:latest
          ports:
            - containerPort: $($svc.Port)
          env:$envYaml
          readinessProbe:
            tcpSocket:
              port: $($svc.Port)
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            tcpSocket:
              port: $($svc.Port)
            initialDelaySeconds: 30
            periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: $name
  namespace: edoc
spec:
  type: $serviceType
  selector:
    app: $name
  ports:
    - port: $($svc.Port)
      targetPort: $($svc.Port)$nodePort
"@
  Set-Content -Path "$svcDir/$name-deployment.yaml" -Value $deploy -Encoding utf8

  $dbDeploy = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $name-db
  namespace: edoc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: $name-db
  template:
    metadata:
      labels:
        app: $name-db
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: $($svc.DbName)
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: edoc-secrets
                  key: DB_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: edoc-secrets
                  key: DB_PASSWORD
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command:
                - sh
                - -c
                - pg_isready -U user -d $($svc.DbName)
            initialDelaySeconds: 10
            periodSeconds: 10
      volumes:
        - name: data
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: $name-db
  namespace: edoc
spec:
  selector:
    app: $name-db
  ports:
    - port: 5432
      targetPort: 5432
"@
  Set-Content -Path "$svcDir/$name-postgres-deployement.yaml" -Value $dbDeploy -Encoding utf8

  $compose = @"
services:
  ${name}-db:
    image: postgres:16-alpine
    container_name: ${name}-db
    environment:
      POSTGRES_DB: $($svc.DbName)
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432"

  ${name}:
    image: edoc/${name}:latest
    container_name: $name
    depends_on:
      - ${name}-db
    ports:
      - "$($svc.Port):$($svc.Port)"
"@
  Set-Content -Path "infra/docker/services/$name.compose.yaml" -Value $compose -Encoding utf8
}

Write-Output "Generated infra manifests for $($services.Count) services"

