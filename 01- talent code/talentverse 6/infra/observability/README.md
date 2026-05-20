
# Observability Stack (OTel + Tempo/Jaeger + Grafana)
Install charts:
```
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts

helm upgrade --install otel-collector open-telemetry/opentelemetry-collector -f infra/observability/otel-collector-values.yaml -n observability --create-namespace
helm upgrade --install tempo grafana/tempo -f infra/observability/tempo-values.yaml -n observability
# OR use Jaeger (all-in-one for demo)
helm upgrade --install jaeger jaegertracing/jaeger -f infra/observability/jaeger-values.yaml -n observability
```
Configure FastAPI/Node apps to export OTLP to `otel-collector:4317`.
