# EKS Cluster
output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  value     = module.eks.cluster_certificate_authority_data
  sensitive = true
}

# ECR Repositories
output "ecr_frontend_url" {
  value = module.ecr.repositories["frontend"]
}

output "ecr_api_gateway_url" {
  value = module.ecr.repositories["api-gateway"]
}

output "ecr_auth_service_url" {
  value = module.ecr.repositories["auth-service"]
}

output "ecr_prediction_service_url" {
  value = module.ecr.repositories["prediction-service"]
}

output "ecr_ai_inference_service_url" {
  value = module.ecr.repositories["ai-inference-service"]
}

output "ecr_repositories" {
  value = module.ecr.repositories
}

# RDS Database
output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_port" {
  value = module.rds.db_port
}

output "db_name" {
  value     = module.rds.db_name
  sensitive = true
}

output "db_username" {
  value     = module.rds.db_username
  sensitive = true
}

output "db_password" {
  value     = module.rds.db_password
  sensitive = true
}

# VPC Network
output "vpc_id" {
  value = module.network.vpc_id
}

output "private_subnet_ids" {
  value = module.network.private_subnet_ids
}

output "database_subnet_ids" {
  value = module.network.database_subnet_ids
}

# S3 Buckets
output "artifacts_bucket" {
  value = module.s3.artifacts_bucket_name
}

# IAM Roles
output "github_oidc_role_arn" {
  value = module.iam.github_oidc_role_arn
}