
resource "aws_db_instance" "talentverse" {
  identifier                 = "talentverse-pg"
  engine                     = "postgres"
  engine_version             = "16.2"
  instance_class             = "db.t3.medium"
  allocated_storage          = 50
  db_name                    = "talentverse"
  username                   = "postgres"
  password                   = "CHANGE_ME"
  publicly_accessible        = false
  backup_retention_period    = 14   # 1..35 days
  backup_window              = "03:00-04:00"
  deletion_protection        = true
  copy_tags_to_snapshot      = true
  auto_minor_version_upgrade = true
  multi_az                   = true
}
