# CloudFront distribution (skeleton) — For private ALB, use VPC Origins (console/API) then import state.
resource "aws_cloudfront_distribution" "edge" {
  enabled             = true
  comment             = "${var.project} edge"
  default_root_object = ""

  origins {
    domain_name = aws_lb.app_alb.dns_name
    origin_id   = "alb-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_read_timeout    = 30
      origin_keepalive_timeout = 5
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values { query_string = true cookies { forward = "all" } }
  }

  price_class = "PriceClass_All"
  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate { acm_certificate_arn = var.certificate_arn ssl_support_method = "sni-only" minimum_protocol_version = "TLSv1.2_2021" }
  is_ipv6_enabled = true
}
