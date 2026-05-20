
output "alb_dns"            { value = aws_lb.alb.dns_name }
output "cloudfront_prod"    { value = aws_cloudfront_distribution.prod.domain_name }
output "cloudfront_staging" { value = aws_cloudfront_distribution.staging.domain_name }
output "api_ecr" { value = aws_ecr_repository.api.repository_url }
output "web_ecr" { value = aws_ecr_repository.web.repository_url }
