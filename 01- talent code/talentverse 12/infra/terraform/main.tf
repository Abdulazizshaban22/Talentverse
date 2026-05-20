
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = "me-south-1" # Middle East (Bahrain)
}

# TODO: VPC, RDS (Postgres 16), EKS cluster, ALB, WAF
