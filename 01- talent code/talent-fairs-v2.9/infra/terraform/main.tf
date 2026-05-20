terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.region
}

# ECS Cluster
resource "aws_ecs_cluster" "tf_cluster" {
  name = "${var.project}-cluster"
}

# ALB
resource "aws_lb" "tf_alb" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = [var.alb_sg_id]
}

# Target group + listener (HTTP 80 → API service)
resource "aws_lb_target_group" "api_tg" {
  name     = "${var.project}-api-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path = "/health"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.tf_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
}

# Task definition + service (API)
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = jsonencode([{
    name      = "api"
    image     = var.api_image
    essential = true
    portMappings = [{ containerPort = 4000, protocol = "tcp" }]
    environment = [
      { name = "PORT_API", value = "4000" }
    ]
  }])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project}-api"
  cluster         = aws_ecs_cluster.tf_cluster.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.private_subnets
    assign_public_ip = false
    security_groups = [var.service_sg_id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api_tg.arn
    container_name   = "api"
    container_port   = 4000
  }
}
