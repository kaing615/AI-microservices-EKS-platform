# Logging Starter

Suggested deployment:

- Loki for log aggregation
- Promtail for scraping pod logs

Example install:

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm upgrade --install logging grafana/loki-stack \
  --namespace logging \
  --create-namespace \
  -f logging/loki-values.yaml
```

