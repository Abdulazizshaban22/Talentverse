output "alb_dns_name" { value = aws_lb.tf_alb.dns_name }
output "cluster_name" { value = aws_ecs_cluster.tf_cluster.name }
