variable "name" { type = string }
variable "region" { type = string, default = "me-central-1" }
variable "domain" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "origin_secret" { type = string }
