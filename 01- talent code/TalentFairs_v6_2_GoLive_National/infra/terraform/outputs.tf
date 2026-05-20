output "cf_domain_name" { value = aws_cloudfront_distribution.edge.domain_name }
output "web_acl_arn"     { value = try(aws_wafv2_web_acl.cf_acl.arn, null) }
