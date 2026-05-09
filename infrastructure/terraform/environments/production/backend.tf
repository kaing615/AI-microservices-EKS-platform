terraform {
  backend "s3" {
    bucket         = "ai-platform-terraform-state-prod"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ai-platform-terraform-locks-prod"
  }
}