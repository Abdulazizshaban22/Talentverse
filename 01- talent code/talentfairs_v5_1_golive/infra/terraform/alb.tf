# Internal ALB (private) — to be used with CloudFront VPC Origins (preview skeleton)
resource "aws_lb" "app_alb" {
  name               = "${var.project}-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = []
  subnets            = var.private_subnets
}

resource "aws_lb_target_group" "api" {
  name        = "${var.project}-api-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  health_check { path = "/health" }
}

resource "aws_lb_target_group" "web" {
  name        = "${var.project}-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  health_check { path = "/" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "fixed-response"
    fixed_response { content_type = "text/plain" message_body = "OK" status_code = "200" }
  }
}

# Listener rules (path-based)
resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action { type = "forward" target_group_arn = aws_lb_target_group.api.arn }
  condition { path_pattern { values = ["/api/*", "/ai/*", "/privacy/*", "/trust/*"] } }
}

resource "aws_lb_listener_rule" "web_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20
  action { type = "forward" target_group_arn = aws_lb_target_group.web.arn }
  condition { path_pattern { values = ["/*"] } }
}
