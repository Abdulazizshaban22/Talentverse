resource "aws_s3_bucket" "media" { bucket = "${var.name}-media"; force_destroy = true }

resource "aws_wafv2_web_acl" "this" {
  name        = "${var.name}-waf"
  description = "Protect CloudFront"
  scope       = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config { cloudwatch_metrics_enabled = true; metric_name = "${var.name}-waf"; sampled_requests_enabled = true }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    statement { managed_rule_group_statement { vendor_name = "AWS"; name = "AWSManagedRulesCommonRuleSet" } }
    visibility_config { cloudwatch_metrics_enabled = true; metric_name = "common"; sampled_requests_enabled = true }
    override_action { none {} }
  }
}
