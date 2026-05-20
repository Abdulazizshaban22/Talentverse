
variable "project" { type = string, default = "talentfairs" }
variable "region"  { type = string, default = "me-central-1" } # عدّلها حسب منطقتك
variable "domain"  { type = string, description = "مثال: talentfairs.sa" }
variable "alb_cert_arn" { type = string, description = "ACM ARN في منطقة التطبيق (للـALB)" }
variable "cf_cert_arn"  { type = string, description = "ACM ARN في us-east-1 (للـCloudFront)" }
variable "vpc_cidr" { type = string, default = "10.28.0.0/16" }
variable "public_subnets" { type = list(string), default = ["10.28.1.0/24","10.28.2.0/24"] }
variable "container_cpu" { type = number, default = 512 }
variable "container_mem" { type = number, default = 1024 }
variable "api_image" { type = string }
variable "web_image" { type = string }
