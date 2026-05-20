variable "project" {}
variable "env" {}
variable "region" {}
variable "domain" {}       # e.g., app.talentfairs.sa
variable "api_domain" {}   # e.g., api.talentfairs.sa
variable "certificate_arn" {} # ACM in us-east-1 for CloudFront
variable "waf_enable" { default = true }
