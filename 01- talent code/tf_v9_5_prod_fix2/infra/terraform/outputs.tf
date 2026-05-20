
output "cloudfront_domain" { value = aws_cloudfront_distribution.cdn.domain_name }
output "alb_dns"           { value = aws_lb.app.dns_name }
output "acm_arn"           { value = aws_acm_certificate_validation.cf.certificate_arn }
