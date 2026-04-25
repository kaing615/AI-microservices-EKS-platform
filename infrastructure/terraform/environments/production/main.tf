provider "aws" {
  region = var.aws_region
}

module "network" {
  source             = "../../modules/network"
  project_name       = var.project_name
  vpc_cidr           = "10.20.0.0/16"
  availability_zones = ["ap-southeast-1a", "ap-southeast-1b"]
  public_subnets     = ["10.20.1.0/24", "10.20.2.0/24"]
  private_subnets    = ["10.20.11.0/24", "10.20.12.0/24"]
  database_subnets   = ["10.20.21.0/24", "10.20.22.0/24"]
}

module "ecr" {
  source       = "../../modules/ecr"
  project_name = var.project_name
}

module "eks" {
  source             = "../../modules/eks"
  project_name       = var.project_name
  cluster_name       = "${var.project_name}-cluster"
  private_subnet_ids = module.network.private_subnet_ids
}

module "rds" {
  source              = "../../modules/rds"
  project_name        = var.project_name
  database_subnet_ids = module.network.database_subnet_ids
  vpc_id              = module.network.vpc_id
}

module "s3" {
  source       = "../../modules/s3"
  project_name = var.project_name
}

module "iam" {
  source                   = "../../modules/iam"
  project_name             = var.project_name
  github_oidc_provider_arn = var.github_oidc_provider_arn
}

