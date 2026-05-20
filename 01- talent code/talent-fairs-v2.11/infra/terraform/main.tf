terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

# us-east-1 provider for CloudFront/ACM
provider "aws" { alias = "use1"; region = "us-east-1" }

# ACM cert for CloudFront
resource "aws_acm_certificate" "cf_cert" {
  provider          = aws.use1
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = var.alt_names
  lifecycle { create_before_destroy = true }
}

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

# WAFv2 (CloudFront scope)
resource "aws_wafv2_web_acl" "cf" {
  name  = "${var.project}-cf-waf"
  scope = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config { cloudwatch_metrics_enabled=true; metric_name="${var.project}-cf-waf"; sampled_requests_enabled=true }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    statement { managed_rule_group_statement { name="AWSManagedRulesCommonRuleSet" vendor_name="AWS" } }
    override_action { none {} }
    visibility_config { cloudwatch_metrics_enabled=true; metric_name="CommonRuleSet"; sampled_requests_enabled=true }
  }

  rule {
    name     = "RateLimit"
    priority = 2
    statement { rate_based_statement { limit = 1000; aggregate_key_type="IP" } }
    action { block {} }
    visibility_config { cloudwatch_metrics_enabled=true; metric_name="RateLimit"; sampled_requests_enabled=true }
  }
}

# Static web (S3) with OAC
resource "aws_s3_bucket" "web" { bucket = "${var.project}-web-bucket" }
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.project}-oac"
  description                       = "OAC for S3 web origin"
  origin_access_control_origin_type  = "s3"
  signing_behavior                   = "always"
  signing_protocol                   = "sigv4"
}

data "aws_iam_policy_document" "web_policy" {
  statement {
    actions   = ["s3:GetObject"]
    principals { type = "Service"; identifiers = ["cloudfront.amazonaws.com"] }
    resources = ["${aws_s3_bucket.web.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cf.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.web_policy.json
}

# ALB reference (assume exists externally or created elsewhere)
data "aws_lb" "alb" { name = var.alb_name }

# CloudFront with dual origins (S3 + ALB), WAF attached
resource "aws_cloudfront_distribution" "cf" {
  enabled         = true
  is_ipv6_enabled = true
  aliases         = concat([var.domain_name], var.alt_names)

  web_acl_id      = aws_wafv2_web_acl.cf.arn

  origin {
    domain_name = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id   = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  origin {
    domain_name = data.aws_lb.alb.dns_name
    origin_id   = "alb-api"
    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
    origin_custom_headers {
      name  = "X-From-CloudFront"
      value = var.secret_header_value
    }
  }

  default_cache_behavior {
    target_origin_id = "s3-web"
    allowed_methods  = ["GET","HEAD","OPTIONS"]
    cached_methods   = ["GET","HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values { query_string = false; cookies { forward = "none" } }
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "alb-api"
    allowed_methods  = ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"]
    cached_methods   = ["GET","HEAD","OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values { query_string = true; headers=["*"]; cookies { forward = "all" } }
  }

  restrictions { geo_restriction { restriction_type = "none" } }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cf_cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

output "cloudfront_domain_name" { value = aws_cloudfront_distribution.cf.domain_name }
output "s3_web_bucket"         { value = aws_s3_bucket.web.id }
