# Blue-Green Deployment Scaffold

This directory contains blue-green deployment references for the platform.

Suggested implementation path:

- install Argo Rollouts
- convert selected services from `Deployment` to `Rollout`
- use `previewService` and `activeService`
- promote after validation and health checks

Recommended first candidates:

- `api-gateway`
- `prediction-service`

