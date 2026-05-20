variable "project" { type = string }
variable "region"  { type = string  default = "me-central-1" }
variable "vpc_id"  { type = string }
variable "public_subnets"  { type = list(string) }
variable "private_subnets" { type = list(string) }
variable "alb_sg_id" { type = string }
variable "service_sg_id" { type = string }
variable "api_image" { type = string  description = "ECR image for @talent/api" }
