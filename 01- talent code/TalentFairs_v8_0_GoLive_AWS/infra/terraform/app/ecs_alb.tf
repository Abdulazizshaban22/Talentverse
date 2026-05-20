
resource "aws_ecs_cluster" "this" { name = "${var.project}-ecs" }

resource "aws_ecr_repository" "api" { name = "${var.project}/api" image_scanning_configuration { scan_on_push = true } }
resource "aws_ecr_repository" "web" { name = "${var.project}/web" image_scanning_configuration { scan_on_push = true } }

resource "aws_lb" "alb" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "aws_lb_target_group" "api" {
  name        = "${var.project}-api-tg"
  port        = 4000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check { path = "/health" }
}

resource "aws_lb_target_group" "web" {
  name        = "${var.project}-web-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check { path = "/health" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port = 80
  protocol = "HTTP"
  default_action { type = "redirect" redirect { port = "443" protocol = "HTTPS" status_code = "HTTP_301" } }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port = 443
  protocol = "HTTPS"
  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.alb_cert_arn

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
  depends_on = [aws_lb.alb]
}

resource "aws_lb_listener_rule" "api_path" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10
  action { type = "forward" target_group_arn = aws_lb_target_group.api.arn }
  condition { path_pattern { values = ["/api/*"] } }
}

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

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu    = var.container_cpu
  memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name      = "api",
    image     = var.api_image,
    essential = true,
    portMappings = [{ containerPort = 4000 }],
    environment = [
      { name="PORT", value="4000" }
    ]
  }])
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu    = var.container_cpu
  memory = var.container_mem
  execution_role_arn = aws_iam_role.task_exec.arn
  container_definitions = jsonencode([{
    name      = "web",
    image     = var.web_image,
    essential = true,
    portMappings = [{ containerPort = 3000 }],
    environment = [
      { name="PORT", value="3000" }
    ]
  }])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project}-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  network_configuration {
    subnets         = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4000
  }
  depends_on = [aws_lb_listener.https]
}

resource "aws_ecs_service" "web" {
  name            = "${var.project}-web"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.web.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  network_configuration {
    subnets         = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }
  depends_on = [aws_lb_listener.https]
}
