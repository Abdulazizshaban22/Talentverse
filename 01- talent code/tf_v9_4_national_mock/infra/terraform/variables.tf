
variable "region"      { type = string  default = "eu-central-1" }
variable "root_domain" { type = string  default = "talentfairs.local" }
variable "vpc_id"      { type = string  default = "vpc-xxxxxxxx" }
variable "subnets"     { type = list(string) default = ["subnet-aaaa", "subnet-bbbb"] }
