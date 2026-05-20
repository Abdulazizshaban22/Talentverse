
# ACM (optional auto)
resource "aws_acm_certificate" "app" {
  count               = var.auto_acm && var.alb_cert_arn == "" ? 1 : 0
  domain_name         = var.domain
  validation_method   = "DNS"
  subject_alternative_names = ["www.${var.domain}", "staging.${var.domain}"]
}
resource "aws_route53_record" "app_cert_validation" {
  count = var.auto_acm && var.alb_cert_arn == "" ? length(aws_acm_certificate.app[0].domain_validation_options) : 0
  name  = aws_acm_certificate.app[0].domain_validation_options[count.index].resource_record_name
  type  = aws_acm_certificate.app[0].domain_validation_options[count.index].resource_record_type
  zone_id = var.hosted_zone_id
  records = [aws_acm_certificate.app[0].domain_validation_options[count.index].resource_record_value]
  ttl   = 60
}
resource "aws_acm_certificate_validation" "app_cert" {
  count = var.auto_acm && var.alb_cert_arn == "" ? 1 : 0
  certificate_arn = aws_acm_certificate.app[0].arn
  validation_record_fqdns = aws_route53_record.app_cert_validation[*].fqdn
}

# ACM for CloudFront (us-east-1)
resource "aws_acm_certificate" "cf" {
  count               = var.auto_acm && var.cf_cert_arn == "" ? 1 : 0
  provider            = aws.us_east_1
  domain_name         = var.domain
  validation_method   = "DNS"
  subject_alternative_names = ["www.${var.domain}", "staging.${var.domain}"]
}
resource "aws_route53_record" "cf_cert_validation" {
  count   = var.auto_acm && var.cf_cert_arn == "" ? length(aws_acm_certificate.cf[0].domain_validation_options) : 0
  name    = aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_type
  zone_id = var.hosted_zone_id
  records = [aws_acm_certificate.cf[0].domain_validation_options[count.index].resource_record_value]
  ttl     = 60
}
resource "aws_acm_certificate_validation" "cf_cert" {
  count = var.auto_acm && var.cf_cert_arn == "" ? 1 : 0
  provider = aws.us_east_1
  certificate_arn = aws_acm_certificate.cf[0].arn
  validation_record_fqdns = aws_route53_record.cf_cert_validation[*].fqdn
}

# CloudFront (prod)
locals {
  use_cf_cert = var.cf_cert_arn != "" ? var.cf_cert_arn : (var.auto_acm ? aws_acm_certificate_validation.cf_cert[0].certificate_arn : "")
}
resource "aws_cloudfront_distribution" "prod" {
  enabled = true
  aliases = [var.domain, "www.${var.domain}"]

  origin {
    domain_name = aws_lb.alb.dns_name
    origin_id   = "alb-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET","HEAD","OPTIONS"]
    cached_methods   = ["GET","HEAD"]
    target_origin_id = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      headers      = ["Authorization","Host","Origin"]
      cookies { forward = "all" }
    }
  }

  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate {
    acm_certificate_arn = local.use_cf_cert
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  web_acl_id = aws_wafv2_web_acl.this.arn
}

# CloudFront (staging)
resource "aws_cloudfront_distribution" "staging" {
  enabled = true
  aliases = ["staging.${var.domain}"]

  origin {
    domain_name = aws_lb.alb.dns_name
    origin_id   = "alb-origin-stage"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET","HEAD","OPTIONS"]
    cached_methods   = ["GET","HEAD"]
    target_origin_id = "alb-origin-stage"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      headers      = ["Authorization","Host","Origin"]
      cookies { forward = "all" }
    }
  }

  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate {
    acm_certificate_arn = local.use_cf_cert
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  web_acl_id = aws_wafv2_web_acl.this.arn
}

# WAF
resource "aws_wafv2_web_acl" "this" {
  name  = "${var.project}-waf"
  scope = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-waf"
    sampled_requests_enabled   = true
  }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    statement { managed_rule_group_statement { name="AWSManagedRulesCommonRuleSet" vendor_name="AWS" } }
    visibility_config { cloudwatch_metrics_enabled=true metric_name="common" sampled_requests_enabled=true }
    override_action { none {} }
  }
}

# Route53 A/AAAA Alias
resource "aws_route53_record" "apex" {
  zone_id = var.hosted_zone_id
  name    = var.domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.prod.domain_name
    zone_id                = aws_cloudfront_distribution.prod.hosted_zone_id
    evaluate_target_health = false
  }
}
resource "aws_route53_record" "apex_v6" {
  zone_id = var.hosted_zone_id
  name    = var.domain
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.prod.domain_name
    zone_id                = aws_cloudfront_distribution.prod.hosted_zone_id
    evaluate_target_health = false
  }
}
resource "aws_route53_record" "www" {
  zone_id = var.hosted_zone_id
  name    = "www.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.prod.domain_name
    zone_id                = aws_cloudfront_distribution.prod.hosted_zone_id
    evaluate_target_health = false
  }
}
resource "aws_route53_record" "staging" {
  zone_id = var.hosted_zone_id
  name    = "staging.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.staging.domain_name
    zone_id                = aws_cloudfront_distribution.staging.hosted_zone_id
    evaluate_target_health = false
  }
}
