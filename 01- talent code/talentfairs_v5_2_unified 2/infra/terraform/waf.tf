
# infra/terraform/waf.tf
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
resource "aws_wafv2_web_acl" "cf_acl" {
  provider    = aws.us_east_1
  name        = "${var.project}-cf-acl"
  description = "Managed rules for CloudFront"
  scope       = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-cf-acl"
    sampled_requests_enabled   = true
  }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "common"
      sampled_requests_enabled   = true
    }
  }
}
# Attach by adding in cloudfront.tf -> aws_cloudfront_distribution.edge:
# web_acl_id = aws_wafv2_web_acl.cf_acl.arn
