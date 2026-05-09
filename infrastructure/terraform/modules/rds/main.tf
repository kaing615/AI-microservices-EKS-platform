resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.database_subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-postgres"
  engine              = "postgres"
  engine_version      = "16.3"
  instance_class      = "db.t4g.micro"
  allocated_storage   = 20
  db_name             = "platform_db"
  username            = "platform_admin"
  password            = random_password.db_password.result
  skip_final_snapshot = true
  publicly_accessible = false
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  tags = {
    Name        = "${var.project_name}-postgres"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}