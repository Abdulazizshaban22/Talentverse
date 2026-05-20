
variable "region"      { type = string  default = "me-central-1" }
variable "root_domain" { type = string }
variable "zone_id"     { type = string, default = "" }
variable "create_zone" { type = bool,   default = false }
variable "vpc_id"      { type = string }
variable "subnets"     { type = list(string) }
