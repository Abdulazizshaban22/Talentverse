variable "project" { type = string }
variable "region"  { type = string  default = "me-central-1" }
variable "domain_name" { type = string }
variable "alt_names" { type = list(string)  default = [] }
variable "zone_id" { type = string }
variable "alb_domain_name" { type = string }
variable "secret_header_value" { type = string  default = "keep-me-secret" }
variable "sa_ip_cidrs" { type = list(string) default = ["5.192.0.0/11","37.96.0.0/12"] }
variable "enable_shield_advanced" { type = bool default = false }
