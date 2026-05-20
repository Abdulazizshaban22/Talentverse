
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = { Name = "${var.project}-vpc" }
}

resource "aws_internet_gateway" "igw" { vpc_id = aws_vpc.main.id }

resource "aws_subnet" "public_a" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.public_subnets[0]
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.available.names[0]
  tags = { Name = "${var.project}-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.public_subnets[1]
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.available.names[1]
  tags = { Name = "${var.project}-public-b" }
}

resource "aws_route_table" "public" { vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0"; gateway_id = aws_internet_gateway.igw.id }
}
resource "aws_route_table_association" "a" { subnet_id = aws_subnet.public_a.id route_table_id = aws_route_table.public.id }
resource "aws_route_table_association" "b" { subnet_id = aws_subnet.public_b.id route_table_id = aws_route_table.public.id }

data "aws_ec2_managed_prefix_list" "cloudfront" { name = "com.amazonaws.global.cloudfront.origin-facing" }

resource "aws_security_group" "alb_sg" {
  name        = "${var.project}-alb-sg"
  description = "Allow HTTP/HTTPS from CloudFront"
  vpc_id      = aws_vpc.main.id

  ingress {
    description      = "HTTPS from CloudFront"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    prefix_list_ids  = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }
  ingress { from_port = 80 to_port = 80 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "ecs_sg" {
  name   = "${var.project}-ecs-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 3000 to_port = 3000 protocol = "tcp" security_groups = [aws_security_group.alb_sg.id] }
  ingress { from_port = 4000 to_port = 4000 protocol = "tcp" security_groups = [aws_security_group.alb_sg.id] }
  egress  { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}
