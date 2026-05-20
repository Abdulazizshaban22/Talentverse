
output "alb_dns" { value = aws_lb.alb.dns_name }
output "cloudfront_domain" { value = aws_cloudfront_distribution.this.domain_name }
output "api_ecr" { value = aws_ecr_repository.api.repository_url }
output "web_ecr" { value = aws_ecr_repository.web.repository_url }
