# Cost Optimization Notes

Target cost optimizations for the AWS deployment:

- use `t3` or `t4g` managed node groups for non-GPU workloads
- enable cluster autoscaler or Karpenter
- scale AI inference separately from gateway traffic
- right-size resource requests and limits
- use HPA and scheduled downscaling for dev environments
- move logs to lifecycle-managed storage
- avoid always-on overprovisioning in `dev`
- use Graviton-based instances where compatible
- review EBS and NAT Gateway costs regularly

Recommended first actions:

1. keep `dev` to a small node group
2. turn on autoscaling before enabling blue-green in production
3. set retention policies for logging and metrics
4. benchmark AI inference before choosing instance classes

