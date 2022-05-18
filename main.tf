terraform {
  required_version = ">= 0.14"
  required_providers {
    aws = ">= 3.0"
  }
}

data "local_file" "cloudformation" {
  filename = "${path.module}/cloudformation.json"
}

locals {
  enable_vpc_for_ingester_lambdas = length(var.vpc_id) > 0 ? true : false
  security_group_ids              = length(var.security_group_ids) > 0 ? var.security_group_ids : [aws_security_group.logging.id]
}

resource "aws_security_group" "logging" {
  count  = local.enable_vpc_for_ingester_lambdas && length(local.security_group_ids) <= 0 ? 1 : 0
  name   = "${var.app_name}-logs-to-humio"
  vpc_id = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_cloudformation_stack" "cloudwatch2humio" {
  name          = "${var.app_name}-cloudwatch2humio"
  template_body = data.local_file.cloudformation.content
  parameters = {
    HumioProtocol                         = var.humio_protocol
    HumioHost                             = var.humio_host
    HumioIngestToken                      = var.humio_ingest_token
    HumioLambdaLogRetention               = var.humio_lambda_log_retention
    EnableCloudWatchLogsAutoSubscription  = tostring(var.enable_cloudwatch_logs_auto_subscription)
    HumioCloudWatchLogsSubscriptionPrefix = var.humio_cloudwatch_logs_subscription_prefix
    EnableCloudWatchLogsBackfillerAutoRun = tostring(var.enable_cloudwatch_logs_backfiller_autorun)
    EnableVPCForIngesterLambdas           = tostring(local.enable_vpc_for_ingester_lambdas)
    SecurityGroupIds                      = join(", ", local.security_group_ids)
    SubnetIds                             = join(", ", var.subnet_ids)
    HumioLambdaLogLevel                   = var.humio_lambda_log_level
    Version                               = var.cloudwatch2humio_version
  }
}
