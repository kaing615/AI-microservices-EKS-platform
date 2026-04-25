# Istio Service Mesh Scaffold

This directory contains starter manifests for introducing Istio to the platform.

Suggested rollout order:

1. Install Istio control plane
2. Enable sidecar injection on `dev`
3. Add `Gateway`, `VirtualService`, and `DestinationRule`
4. Introduce traffic splitting for blue-green or canary releases
5. Add mTLS and request-level policies

