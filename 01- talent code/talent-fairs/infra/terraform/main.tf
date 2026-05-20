terraform {
  required_version = ">= 1.6"
  required_providers { aws = { source = "hashicorp/aws", version = ">= 5.0" } }
}

provider "aws" { region = var.region }

# ECS cluster
module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 6.5"

  cluster_name = var.name
}

# (Example) ACM for CloudFront in us-east-1
provider "aws" { alias = "us_east_1"; region = "us-east-1" }

resource "aws_acm_certificate" "this" {
  provider          = aws.us_east_1
  domain_name       = var.domain
  validation_method = "DNS"
}

# You would create ALB + ECS services and add CloudFront with ALB origin here.
# See variables.tf for required inputs.
