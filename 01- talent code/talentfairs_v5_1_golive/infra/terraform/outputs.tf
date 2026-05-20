output "alb_dns" { value = aws_lb.app_alb.dns_name }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.edge.id }
output "cloudfront_domain_name" { value = aws_cloudfront_distribution.edge.domain_name }
