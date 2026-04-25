provider "aws" {
  region = var.aws_region
}

module "network" {
  source             = "../../modules/network"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  database_subnets   = var.database_subnets
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

