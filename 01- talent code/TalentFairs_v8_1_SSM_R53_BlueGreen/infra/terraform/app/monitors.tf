
# SNS Topic & Subscription
resource "aws_sns_topic" "alerts" { name = "${var.project}-alerts" }
resource "aws_sns_topic_subscription" "email" {
  count = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudFront 5xx Error Rate (Prod)
resource "aws_cloudwatch_metric_alarm" "cf_5xx_prod" {
  alarm_name          = "${var.project}-cf-5xx-prod"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 1
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  statistic           = "Average"
  period              = 60
  dimensions = { DistributionId = aws_cloudfront_distribution.prod.id, Region = "Global" }
  alarm_description   = "CloudFront 5xxErrorRate > 1% (prod)"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# ALB Target 5XX (sum) for API+WEB (Prod)
resource "aws_cloudwatch_metric_alarm" "alb_5xx_api" {
  alarm_name          = "${var.project}-alb-5xx-api"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 5
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  statistic           = "Sum"
  period              = 60
  dimensions = { LoadBalancer = aws_lb.alb.arn_suffix, TargetGroup = aws_lb_target_group.api_blue.arn_suffix }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
resource "aws_cloudwatch_metric_alarm" "alb_5xx_web" {
  alarm_name          = "${var.project}-alb-5xx-web"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 5
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  statistic           = "Sum"
  period              = 60
  dimensions = { LoadBalancer = aws_lb.alb.arn_suffix, TargetGroup = aws_lb_target_group.web_blue.arn_suffix }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Latency p95
resource "aws_cloudwatch_metric_alarm" "alb_latency_p95" {
  alarm_name          = "${var.project}-alb-latency-p95"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  extended_statistic  = "p95"
  period              = 60
  dimensions = { LoadBalancer = aws_lb.alb.arn_suffix }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
