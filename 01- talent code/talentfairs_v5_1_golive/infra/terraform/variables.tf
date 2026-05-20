variable "project" { type = string }
variable "region"  { type = string  default = "me-central-1" } # Riyadh
variable "env"     { type = string  default = "prod" }
variable "domain"  { type = string }          # app.talentfairs.sa
variable "api_domain" { type = string }       # api.talentfairs.sa
variable "vpc_id"  { type = string }
variable "private_subnets" { type = list(string) }
variable "public_subnets"  { type = list(string) }
variable "certificate_arn" { type = string }  # ACM cert in us-east-1 for CloudFront
variable "ecr_api_repo" { type = string }
variable "ecr_web_repo" { type = string }
variable "container_cpu" { type = number default = 512 }
variable "container_memory" { type = number default = 1024 }
variable "desired_count" { type = number default = 2 }
