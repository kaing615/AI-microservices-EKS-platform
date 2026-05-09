module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.35"

  subnet_ids = var.private_subnet_ids

  enable_cluster_creator_admin_permissions = true

  # Allow nodes in private subnets to reach the control plane
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Explicit node security group rules
  node_security_group_rules = {
    # Allow nodes to communicate with control plane on 443
    ingress_https_from_control_plane = {
      description = "Control plane to node HTTPS"
      protocol    = "tcp"
      from_port   = 443
      to_port     = 443
      type        = "ingress"
      source_cluster_security_group = true
    }
    # Allow kubelet on 10250
    ingress_kubelet_from_control_plane = {
      description = "Control plane to kubelet"
      protocol    = "tcp"
      from_port   = 10250
      to_port     = 10250
      type        = "ingress"
      source_cluster_security_group = true
    }
    # Allow API server webhook on 9443
    ingress_webhook_from_control_plane = {
      description = "Control plane to webhook 9443"
      protocol    = "tcp"
      from_port   = 9443
      to_port     = 9443
      type        = "ingress"
      source_cluster_security_group = true
    }
  }

  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2

      iam_role_attach_policy_arn = [
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
      ]
    }
  }
}
