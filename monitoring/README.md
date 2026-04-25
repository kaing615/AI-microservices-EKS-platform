# Monitoring Starter

Suggested deployment:

- `kube-prometheus-stack` via Helm
- Grafana dashboard import for application and cluster metrics

Example install:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/prometheus-values.yaml
```

