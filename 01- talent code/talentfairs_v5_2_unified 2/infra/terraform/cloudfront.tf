resource "aws_cloudfront_distribution" "edge" {
  enabled = true
  origins {
    domain_name = aws_lb.app_alb.dns_name
    origin_id   = "alb-origin"
    custom_origin_config { http_port=80 https_port=443 origin_protocol_policy="http-only" }
  }
  default_cache_behavior {
    allowed_methods=["GET","HEAD","OPTIONS"]
    cached_methods=["GET","HEAD"]
    target_origin_id="alb-origin"
    viewer_protocol_policy="redirect-to-https"
    forwarded_values { query_string=true cookies { forward="all" } }
  }
  viewer_certificate { acm_certificate_arn = var.certificate_arn ssl_support_method="sni-only" minimum_protocol_version="TLSv1.2_2021" }
}
