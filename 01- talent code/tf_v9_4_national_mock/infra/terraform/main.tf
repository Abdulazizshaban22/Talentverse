
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ACM in us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Route53 (optional mock zone)
resource "aws_route53_zone" "mock" {
  name = var.root_domain
  comment = "Mock zone for TalentFairs"
}

# Public certificate for CloudFront (us-east-1)
resource "aws_acm_certificate" "cf" {
  provider          = aws.us_east_1
  domain_name       = "*.${var.root_domain}"
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cf_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cf.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }
  name    = each.value.name
  type    = each.value.type
  zone_id = aws_route53_zone.mock.zone_id
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cf" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.cf.arn
  validation_record_fqdns = [for r in aws_route53_record.cf_validation : r.fqdn]
}

# ALB + ECS (simplified placeholders)
resource "aws_ecs_cluster" "this" {
  name = "tf-ecs-cluster"
}

resource "aws_lb" "app" {
  name               = "tf-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = []
  subnets            = var.subnets
}

resource "aws_lb_target_group" "api" {
  name        = "tf-api-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check { path = "/api/health" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.api.arn }
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "tf-oac"
  origin_access_control_origin_type = "custom"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "TalentFairs CDN"
  aliases             = ["app.${var.root_domain}"]

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "alb-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    forwarded_values {
      query_string = true
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.cf.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "app_alias" {
  zone_id = aws_route53_zone.mock.zone_id
  name    = "app.${var.root_domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}
