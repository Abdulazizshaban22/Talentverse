
resource "aws_ecs_cluster" "this" { name = "${var.project}-ecs" }

resource "aws_ecr_repository" "api" { name = "${var.project}/api" image_scanning_configuration { scan_on_push = true } }
resource "aws_ecr_repository" "web" { name = "${var.project}/web" image_scanning_configuration { scan_on_push = true } }

resource "aws_lb" "alb" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

# Target Groups — Prod Blue/Green
resource "aws_lb_target_group" "api_blue"  { name = "${var.project}-api-blue"  port = 4000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }
resource "aws_lb_target_group" "api_green" { name = "${var.project}-api-green" port = 4000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }
resource "aws_lb_target_group" "web_blue"  { name = "${var.project}-web-blue"  port = 3000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }
resource "aws_lb_target_group" "web_green" { name = "${var.project}-web-green" port = 3000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }

# Target Groups — Staging
resource "aws_lb_target_group" "api_stage" { name = "${var.project}-api-stage" port = 4000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }
resource "aws_lb_target_group" "web_stage" { name = "${var.project}-web-stage" port = 3000 protocol = "HTTP" target_type = "ip" vpc_id = aws_vpc.main.id health_check { path = "/health" } }

# Listeners
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port = 80
  protocol = "HTTP"
  default_action { type = "redirect" redirect { port = "443" protocol = "HTTPS" status_code = "HTTP_301" } }
}

# ACM Certificates (optional auto issuance)
locals {
  use_app_cert = var.alb_cert_arn != "" ? var.alb_cert_arn : (var.auto_acm ? aws_acm_certificate_validation.app_cert[0].certificate_arn : "")
}
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port = 443
  protocol = "HTTPS"
  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn = local.use_app_cert

  default_action {
    type = "forward"
    forward {
      target_group {
        arn    = aws_lb_target_group.web_blue.arn
        weight = var.web_blue_weight
      }
      target_group {
        arn    = aws_lb_target_group.web_green.arn
        weight = var.web_green_weight
      }
      stickiness { enabled = true duration = 60 }
    }
  }
  depends_on = [aws_lb.alb]
}

# Stage Host routing (staging.<domain>)
resource "aws_lb_listener_rule" "stage_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 5
  action { type = "forward" target_group_arn = aws_lb_target_group.api_stage.arn }
  condition { host_header { values = ["staging.${var.domain}"] } }
  condition { path_pattern { values = ["/api/*"] } }
}

resource "aws_lb_listener_rule" "stage_web" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 6
  action { type = "forward" target_group_arn = aws_lb_target_group.web_stage.arn }
  condition { host_header { values = ["staging.${var.domain}"] } }
}

# Prod API path rule with Blue/Green weights
resource "aws_lb_listener_rule" "api_prod" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10
  action {
    type = "forward"
    forward {
      target_group { arn = aws_lb_target_group.api_blue.arn  weight = var.api_blue_weight }
      target_group { arn = aws_lb_target_group.api_green.arn weight = var.api_green_weight }
      stickiness { enabled = true duration = 60 }
    }
  }
  condition { path_pattern { values = ["/api/*"] } }
}

# IAM for tasks
resource "aws_iam_role" "task_exec" {
  name = "${var.project}-task-exec"
  assume_role_policy = jsonencode({
    Version="2012-10-17",
    Statement=[{Effect="Allow",Principal={Service="ecs-tasks.amazonaws.com"},Action="sts:AssumeRole"}]
  })
}
resource "aws_iam_role_policy_attachment" "task_exec_ecr" {
  role = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# SSM access for task
resource "aws_iam_role_policy" "task_ssm" {
  name = "${var.project}-task-ssm"
  role = aws_iam_role.task_exec.id
  policy = jsonencode({
    Version="2012-10-17",
    Statement=[{
      Effect="Allow",
      Action=["ssm:GetParameters","ssm:GetParameter","kms:Decrypt"],
      Resource="*"
    }]
  })
}

# Data SSM parameters (must exist; seed via scripts/ssm_seed.sh)
data "aws_ssm_parameter" "opensearch_node" { name = "${var.ssm_prefix}OPENSEARCH_NODE" with_decryption = true }
data "aws_ssm_parameter" "opensearch_auth" { name = "${var.ssm_prefix}OPENSEARCH_AUTH" with_decryption = true }
data "aws_ssm_parameter" "keycloak_base"   { name = "${var.ssm_prefix}KEYCLOAK_BASE"  with_decryption = true }
data "aws_ssm_parameter" "keycloak_realm"  { name = "${var.ssm_prefix}KEYCLOAK_REALM" with_decryption = true }
data "aws_ssm_parameter" "hyperpay_token"  { name = "${var.ssm_prefix}HYPERPAY_ACCESS_TOKEN" with_decryption = true }
data "aws_ssm_parameter" "tap_secret"      { name = "${var.ssm_prefix}TAP_SECRET" with_decryption = true }
data "aws_ssm_parameter" "resend_key"      { name = "${var.ssm_prefix}RESEND_API_KEY" with_decryption = true }

# ECS Task defs — API BLUE/GREEN + STAGE
locals {
  api_secrets = [
    { name = "OPENSEARCH_NODE",  valueFrom = data.aws_ssm_parameter.opensearch_node.arn },
    { name = "OPENSEARCH_AUTH",  valueFrom = data.aws_ssm_parameter.opensearch_auth.arn },
    { name = "KEYCLOAK_BASE",    valueFrom = data.aws_ssm_parameter.keycloak_base.arn },
    { name = "KEYCLOAK_REALM",   valueFrom = data.aws_ssm_parameter.keycloak_realm.arn },
    { name = "HYPERPAY_ACCESS_TOKEN", valueFrom = data.aws_ssm_parameter.hyperpay_token.arn },
    { name = "TAP_SECRET",       valueFrom = data.aws_ssm_parameter.tap_secret.arn },
    { name = "RESEND_API_KEY",   valueFrom = data.aws_ssm_parameter.resend_key.arn }
  ]
}

resource "aws_ecs_task_definition" "api_blue" {
  family                   = "${var.project}-api-blue"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu    = var.container_cpu
  memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "api",
    image = var.api_image_blue,
    essential = true,
    portMappings = [{ containerPort = 4000 }],
    secrets = local.api_secrets,
    environment = [{ name = "PORT", value = "4000" }]
  }])
}

resource "aws_ecs_task_definition" "api_green" {
  family                   = "${var.project}-api-green"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu    = var.container_cpu
  memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "api",
    image = var.api_image_green,
    essential = true,
    portMappings = [{ containerPort = 4000 }],
    secrets = local.api_secrets,
    environment = [{ name = "PORT", value = "4000" }]
  }])
}

resource "aws_ecs_task_definition" "api_stage" {
  family                   = "${var.project}-api-stage"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu    = var.container_cpu
  memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "api",
    image = var.api_image_green,
    essential = true,
    portMappings = [{ containerPort = 4000 }],
    secrets = local.api_secrets,
    environment = [{ name = "PORT", value = "4000" }]
  }])
}

# WEB task defs
resource "aws_ecs_task_definition" "web_blue" {
  family = "${var.project}-web-blue"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = var.container_cpu; memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "web", image = var.web_image_blue, essential = true,
    portMappings = [{ containerPort = 3000 }],
    environment = [{ name = "PORT", value = "3000" }]
  }])
}
resource "aws_ecs_task_definition" "web_green" {
  family = "${var.project}-web-green"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = var.container_cpu; memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "web", image = var.web_image_green, essential = true,
    portMappings = [{ containerPort = 3000 }],
    environment = [{ name = "PORT", value = "3000" }]
  }])
}
resource "aws_ecs_task_definition" "web_stage" {
  family = "${var.project}-web-stage"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = var.container_cpu; memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name = "web", image = var.web_image_green, essential = true,
    portMappings = [{ containerPort = 3000 }],
    environment = [{ name = "PORT", value = "3000" }]
  }])
}

# Services
resource "aws_ecs_service" "api_blue" {
  name = "${var.project}-api-blue"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api_blue.arn
  launch_type = "FARGATE"
  desired_count = 2
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.api_blue.arn container_name = "api" container_port = 4000 }
}

resource "aws_ecs_service" "api_green" {
  name = "${var.project}-api-green"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api_green.arn
  launch_type = "FARGATE"
  desired_count = 0
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.api_green.arn container_name = "api" container_port = 4000 }
}

resource "aws_ecs_service" "api_stage" {
  name = "${var.project}-api-stage"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api_stage.arn
  launch_type = "FARGATE"
  desired_count = 1
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.api_stage.arn container_name = "api" container_port = 4000 }
}

resource "aws_ecs_service" "web_blue" {
  name = "${var.project}-web-blue"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.web_blue.arn
  launch_type = "FARGATE"
  desired_count = 2
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.web_blue.arn container_name = "web" container_port = 3000 }
}

resource "aws_ecs_service" "web_green" {
  name = "${var.project}-web-green"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.web_green.arn
  launch_type = "FARGATE"
  desired_count = 0
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.web_green.arn container_name = "web" container_port = 3000 }
}

resource "aws_ecs_service" "web_stage" {
  name = "${var.project}-web-stage"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.web_stage.arn
  launch_type = "FARGATE"
  desired_count = 1
  network_configuration {
    subnets = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer { target_group_arn = aws_lb_target_group.web_stage.arn container_name = "web" container_port = 3000 }
}
