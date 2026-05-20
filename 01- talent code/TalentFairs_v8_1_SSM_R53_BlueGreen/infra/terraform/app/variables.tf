
variable "project" { type = string, default = "talentfairs" }
variable "region"  { type = string, default = "me-central-1" }
variable "domain"  { type = string, description = "example: talentfairs.sa" }
variable "hosted_zone_id" { type = string, description = "Existing Route53 public zone ID" }

# ACM
variable "auto_acm"     { type = bool,  default = true }
variable "alb_cert_arn" { type = string, default = "" } # optional
variable "cf_cert_arn"  { type = string, default = "" } # optional (us-east-1)

# SSM
variable "ssm_prefix" { type = string, default = "/talentfairs/prod/" }

# Images
variable "api_image_blue"  { type = string }
variable "api_image_green" { type = string }
variable "web_image_blue"  { type = string }
variable "web_image_green" { type = string }

# Blue/Green weights (0..100)
variable "api_blue_weight"  { type = number, default = 100 }
variable "api_green_weight" { type = number, default = 0 }
variable "web_blue_weight"  { type = number, default = 100 }
variable "web_green_weight" { type = number, default = 0 }

# VPC
variable "vpc_cidr"       { type = string, default = "10.28.0.0/16" }
variable "public_subnets" { type = list(string), default = ["10.28.1.0/24","10.28.2.0/24"] }

# ECS sizing
variable "container_cpu" { type = number, default = 512 }
variable "container_mem" { type = number, default = 1024 }

# Alerts
variable "alert_email" { type = string, default = "" }
