terraform {
  required_version = ">= 0.14"
  required_providers {
    aws = ">= 4.15"
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
  # Read the explicit port from host:port or [IPv6]:port.
  # Without an explicit port, use HTTP/80 or HTTPS/443.
  humio_port   = try(tonumber(regex("^(?:\\[[^]]+\\]|[^/:]+):([0-9]+)(?:[/?#]|$)", var.humio_host)[0]), var.humio_protocol == "HTTP" ? 80 : 443)
  egress_ports = toset([local.humio_port, 443])
  archive_name = "cloudwatch2humio.zip"
  archive_path = "${path.module}/${local.archive_name}"
}

# trivy:ignore:AWS-0104 because endpoint IP addresses can change
resource "aws_security_group" "humio-logger-vpc-sg" {
  count  = local.enable_vpc_for_ingester_lambdas && length(var.security_group_ids) <= 0 ? 1 : 0
  name   = "${var.app_name}-humio-logger-vpn-sg"
  vpc_id = var.vpc_id

  dynamic "egress" {
    for_each = local.egress_ports
    content {
      description      = egress.value == 443 ? "HTTPS" : egress.value == 80 ? "HTTP" : "Humio ingestion"
      from_port        = egress.value
      to_port          = egress.value
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
    }
  }
}
