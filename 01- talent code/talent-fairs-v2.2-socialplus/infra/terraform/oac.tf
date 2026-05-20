resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.name}-oac"
  description                       = "Access control for S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
