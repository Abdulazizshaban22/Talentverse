terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

# Separate provider for us-east-1 (CloudFront certs)
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}

# ACM certificate in us-east-1 for CloudFront
resource "aws_acm_certificate" "cf_cert" {
  provider          = aws.use1
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = var.alt_names
  lifecycle { create_before_destroy = true }
}

# Route53 DNS validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cf_cert.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
  zone_id = var.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.value]
}

resource "aws_acm_certificate_validation" "cf_cert" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.cf_cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ECS/ALB infra (assumes created as in v2.9)
resource "aws_lb" "tf_alb" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = [var.alb_sg_id]
}

resource "aws_lb_target_group" "api_tg" {
  name     = "${var.project}-api-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check { path = "/health" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.tf_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.api_tg.arn }
}

# CloudFront in front of ALB
resource "aws_cloudfront_distribution" "cf" {
  enabled             = true
  is_ipv6_enabled     = true
  aliases             = concat([var.domain_name], var.alt_names)
  default_root_object = ""

  origin {
    domain_name = aws_lb.tf_alb.dns_name
    origin_id   = "alb-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    origin_custom_headers {
      name  = "X-From-CloudFront"
      value = var.secret_header_value
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"]
    cached_methods         = ["GET","HEAD","OPTIONS"]
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies { forward = "all" }
    }
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions { geo_restriction { restriction_type = "none" } }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.cf_cert.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}

output "cloudfront_domain_name" { value = aws_cloudfront_distribution.cf.domain_name }
output "alb_dns_name"          { value = aws_lb.tf_alb.dns_name }
