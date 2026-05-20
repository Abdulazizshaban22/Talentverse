resource "aws_ecs_cluster" "main" { name = "${var.project}-ecs" }
resource "aws_cloudwatch_log_group" "api" { name="/ecs/${var.project}/api" retention_in_days=30 }
resource "aws_cloudwatch_log_group" "web" { name="/ecs/${var.project}/web" retention_in_days=30 }
