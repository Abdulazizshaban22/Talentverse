provider "aws" { alias = "us_east_1" region = "us-east-1" }

# Import this from console-created VPC origin or create via Terraform when ready
resource "aws_cloudfront_vpc_origin" "private_app" {
  provider = aws.us_east_1
  # Arguments are populated after import. Keep minimal HCL to allow import first.
}

resource "aws_cloudfront_distribution" "edge" {
  provider = aws.us_east_1
  enabled             = true
  is_ipv6_enabled     = true
  aliases             = [var.domain]

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  default_cache_behavior {
    target_origin_id = "private-app"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods  = ["GET","HEAD","OPTIONS","PUT","POST","PATCH","DELETE"]
    cached_methods   = ["GET","HEAD","OPTIONS"]
    compress = true
    forwarded_values { query_string = true cookies { forward = "all" } }
  }

  origin {
    origin_id = "private-app"
    # VPC origin linkage
    vpc_origin_config { vpc_origin_id = aws_cloudfront_vpc_origin.private_app.id }
  }

  restrictions { geo_restriction { restriction_type = "none" } }
  price_class = "PriceClass_200"

  dynamic "web_acl_id" {
    for_each = try([aws_wafv2_web_acl.cf_acl.arn], [])
    content { } # attach via CLI/script if needed
  }
}
