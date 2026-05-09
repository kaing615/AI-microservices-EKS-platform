# Terraform state backend configuration for production
# Note: required_version and required_providers are in versions.tf

terraform {
  backend "s3" {
    bucket         = "ai-platform-terraform-state-prod"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ai-platform-terraform-locks-prod"
  }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "ai-platform-terraform-state-prod"

  tags = {
    Name        = "AI Platform Terraform State - Production"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "ai-platform-terraform-locks-prod"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "AI Platform Terraform Locks - Production"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}