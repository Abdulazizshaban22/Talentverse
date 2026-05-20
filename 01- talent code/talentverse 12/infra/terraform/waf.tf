
resource "aws_wafv2_web_acl" "talentverse_waf" {
  name        = "talentverse-waf"
  description = "WAF for ALB"
  scope       = "REGIONAL"
  default_action { allow {} }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    statement { managed_rule_group_statement { name = "AWSManagedRulesCommonRuleSet" vendor_name = "AWS" } }
    visibility_config { sampled_requests_enabled = true; cloudwatch_metrics_enabled = true; metric_name = "common" }
  }

  visibility_config { sampled_requests_enabled = true; cloudwatch_metrics_enabled = true; metric_name = "web-acl" }
}

# Associate with an existing ALB (pass arn via variable)
resource "aws_wafv2_web_acl_association" "alb_assoc" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.talentverse_waf.arn
}
