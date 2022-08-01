terraform {
  required_version = ">= 0.14"
  required_providers {
    aws = ">= 3.0"
  }
}

locals {
  enable_vpc_for_ingester_lambdas   = length(var.vpc_id) > 0
  add_permission_boundary           = length(var.humio_lambda_role_permissions_boundary) > 0
  create_source_storage             = length(var.s3_bucket) == 0
  create_log_ingester               = length(var.logs_subscriptions) > 0
  create_metric_ingester            = length(var.metric_conf) > 0
  create_metric_statistics_ingester = length(var.metric_statistics_conf) > 0
  bucket_name                       = length(var.s3_bucket) > 0 ? var.s3_bucket : "${var.app_name}-humio-logger"
  archive_name                      = "cloudwatch2humio.zip"
  archive_path                      = "${path.module}/${local.archive_name}"
}

resource "aws_security_group" "humio-logger-vpc-sg" {
  count  = local.enable_vpc_for_ingester_lambdas && length(var.security_group_ids) <= 0 ? 1 : 0
  name   = "${var.app_name}-humio-logger-vpn-sg"
  vpc_id = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
