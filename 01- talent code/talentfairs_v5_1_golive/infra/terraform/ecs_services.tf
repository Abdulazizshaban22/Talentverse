resource "aws_iam_role" "task_exec" {
  name = "${var.project}-task-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_exec_policy" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.task_exec.arn
  container_definitions    = jsonencode([{
    name      = "api",
    image     = var.ecr_api_repo,
    essential = true,
    portMappings = [{ containerPort = 4000 }],
    logConfiguration = {
      logDriver = "awslogs",
      options = { awslogs-group = aws_cloudwatch_log_group.api.name, awslogs-region = var.region, awslogs-stream-prefix = "ecs" }
    },
    environment = [
      { name = "NODE_ENV", value = "production" }
    ]
  }])
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.task_exec.arn
  container_definitions    = jsonencode([{
    name      = "web",
    image     = var.ecr_web_repo,
    essential = true,
    portMappings = [{ containerPort = 3000 }],
    logConfiguration = {
      logDriver = "awslogs",
      options = { awslogs-group = aws_cloudwatch_log_group.web.name, awslogs-region = var.region, awslogs-stream-prefix = "ecs" }
    },
    environment = [
      { name = "NEXT_TELEMETRY_DISABLED", value = "1" },
      { name = "NODE_ENV", value = "production" }
    ]
  }])
}

resource "aws_security_group" "svc" {
  name        = "${var.project}-svc"
  description = "ECS services to ALB"
  vpc_id      = var.vpc_id
  ingress { from_port = 80 to_port = 80 protocol = "tcp" security_groups = [aws_lb.app_alb.security_groups[0]] }
  egress  { from_port = 0  to_port = 0  protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_ecs_service" "api" {
  name            = "${var.project}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.private_subnets
    assign_public_ip = false
    security_groups = [aws_security_group.svc.id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4000
  }
  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "web" {
  name            = "${var.project}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.private_subnets
    assign_public_ip = false
    security_groups = [aws_security_group.svc.id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }
  depends_on = [aws_lb_listener.http]
}
