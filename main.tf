terraform {
  required_version = ">= 0.12.17"
  required_providers {
    aws = ">= 3.0"
  }
}

module "acs" {
  source            = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.5.0"
  vpc_vpn_to_campus = true
}

data "local_file" "cloudformation" {
  filename = "${path.module}/cloudformation.json"
}

resource "aws_security_group" "logging" {
  name   = "${var.app_name}-logs-to-humio"
  vpc_id = module.acs.vpc.id

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
    HumioProtocol                         = "https"
    HumioHost                             = var.app_env == "prd" ? module.acs.humio_prd_endpoint : module.acs.humio_dev_endpoint
    HumioIngestToken                      = var.app_env == "prd" ? module.acs.humio_prd_token : module.acs.humio_dev_token
    HumioLambdaLogRetention               = var.humio_lambda_log_retention
    EnableCloudWatchLogsAutoSubscription  = tostring(var.enable_cloudwatch_logs_auto_subscription)
    HumioCloudWatchLogsSubscriptionPrefix = var.humio_cloudwatch_logs_subscription_prefix
    EnableCloudWatchLogsBackfillerAutoRun = tostring(var.enable_cloudwatch_logs_backfiller_autorun)
    EnableVPCForIngesterLambdas           = "true"
    SecurityGroups                        = [aws_security_group.logging.id]
    SubnetIds                             = module.acs.private_subnet_ids
    HumioLambdaLogLevel                   = var.humio_lambda_log_level
  }
}
