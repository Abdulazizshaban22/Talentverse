variable "project" { type = string  default = "talent-fairs" }
variable "region"  { type = string  default = "us-east-1" }
variable "domain_name" { type = string  default = "example.com" }

variable "api_image" { type = string  default = "public.ecr.aws/amazonlinux/amazonlinux:2023" }

variable "alb_secret_header_name" { type = string  default = "X-ALB-Secret" }
variable "alb_secret_header_value" { type = string  default = "please-change" }
