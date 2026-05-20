variable "project" { type = string }
variable "region"  { type = string  default = "me-central-1" }
variable "vpc_id"  { type = string }
variable "public_subnets"  { type = list(string) }
variable "private_subnets" { type = list(string) }
variable "alb_sg_id" { type = string }
variable "service_sg_id" { type = string }
variable "domain_name" { type = string }
variable "alt_names" { type = list(string)  default = [] }
variable "zone_id" { type = string }
variable "secret_header_value" { type = string  default = "keep-me-secret" }
