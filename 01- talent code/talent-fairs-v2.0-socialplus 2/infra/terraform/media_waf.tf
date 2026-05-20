resource "aws_s3_bucket" "media" {
  bucket = "${var.name}-media"
  force_destroy = true
}

resource "aws_wafv2_web_acl" "this" {
  name        = "${var.name}-waf"
  description = "Protect CloudFront"
  scope       = "CLOUDFRONT"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name = "${var.name}-waf"
    sampled_requests_enabled = true
  }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    statement { managed_rule_group_statement { vendor_name = "AWS"; name = "AWSManagedRulesCommonRuleSet" } }
    visibility_config { cloudwatch_metrics_enabled = true; metric_name = "common"; sampled_requests_enabled = true }
    override_action { none {} }
  }
}

resource "aws_cloudfront_distribution" "this_attach" {
  # dummy to illustrate association (attach to existing distribution in actual apply)
  web_acl_id = aws_wafv2_web_acl.this.arn
  enabled = false
  origin { domain_name = "example.com"; origin_id = "placeholder" 
    custom_origin_config { http_port=80, https_port=443, origin_protocol_policy="http-only" } }
  default_cache_behavior { target_origin_id="placeholder"; viewer_protocol_policy="redirect-to-https"; allowed_methods=["GET","HEAD"] }
}
