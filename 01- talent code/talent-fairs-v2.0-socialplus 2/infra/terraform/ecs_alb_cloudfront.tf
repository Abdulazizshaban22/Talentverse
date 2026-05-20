module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"
  name    = "${var.name}-alb"
  load_balancer_type = "application"
  vpc_id  = var.vpc_id
  subnets = var.subnet_ids
  http_tcp_listeners = [{ port = 80, protocol = "HTTP" }]
  https_listeners = []
  target_groups = [
    { name = "api",    backend_protocol = "HTTP", backend_port = 4000, target_type = "ip", health_check = { path="/health" } },
    { name = "ai",     backend_protocol = "HTTP", backend_port = 8000, target_type = "ip", health_check = { path="/health" } },
    { name = "points", backend_protocol = "HTTP", backend_port = 4100, target_type = "ip", health_check = { path="/health" } },
  ]
}

module "ecs_services" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "~> 6.5"
  name            = var.name
  cluster_arn     = module.ecs.cluster_arn
  desired_count   = 1
  launch_type     = "FARGATE"
  cpu             = 256
  memory          = 512
  subnet_ids      = var.subnet_ids
  security_group_ids = []
  container_definitions = [
    { name  = "api",     image = "public.ecr.aws/docker/library/node:20-alpine",    port_mappings = [{ containerPort = 4000 }] },
    { name  = "ai-core", image = "public.ecr.aws/docker/library/python:3.11-slim", port_mappings = [{ containerPort = 8000 }] },
    { name  = "points",  image = "public.ecr.aws/docker/library/node:20-alpine",    port_mappings = [{ containerPort = 4100 }] }
  ]
}

resource "aws_cloudfront_distribution" "this" {
  enabled = true
  aliases = [var.domain]
  origin {
    domain_name = module.alb.lb_dns_name
    origin_id   = "alb-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_read_timeout    = 30
      origin_keepalive_timeout = 5
    }
    origin_custom_header { name = "X-Origin-Secret", value = var.origin_secret }
  }
  default_cache_behavior {
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET","HEAD","OPTIONS","PUT","POST","PATCH","DELETE"]
    cached_methods         = ["GET","HEAD"]
    forwarded_values { query_string = true, headers = ["Authorization","Content-Type"], cookies { forward = "all" } }
  }
  viewer_certificate { acm_certificate_arn = aws_acm_certificate.this.arn, ssl_support_method = "sni-only", minimum_protocol_version = "TLSv1.2_2021" }
  restrictions { geo_restriction { restriction_type = "none" } }
  tags = { Project = var.name }
}
