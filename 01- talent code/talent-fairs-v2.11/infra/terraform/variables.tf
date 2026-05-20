variable "project" { type = string }
variable "region"  { type = string  default = "me-central-1" }
variable "domain_name" { type = string }
variable "alt_names" { type = list(string)  default = [] }
variable "zone_id" { type = string }
variable "alb_name" { type = string }
variable "secret_header_value" { type = string  default = "keep-me-secret" }
