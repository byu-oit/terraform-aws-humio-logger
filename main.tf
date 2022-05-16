terraform {
  required_version = ">= 0.14.11"
  required_providers {
    aws = ">= 3.0"
  }
}

module "acs" {
  source = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.4.1"
}

data "local_file" "cloudformation" {
  filename = "${path.module}/cloudformation.json"
}

resource "aws_cloudformation_stack" "cloudwatch" {
  name = "${var.app_name}-cloudwatch2humio"

  parameters = {
    HumioProtocol = var.humio_protocol
    HumioHost = var.humio_host
    HumioIngestToken = var.humio_ingest_token
    HumioLambdaLogRetention = var.humio_lambda_log_retention
    EnableCloudWatchLogsAutoSubscription = tostring(var.enable_cloudwatch_logs_auto_subscription)
    HumioCloudWatchLogsSubscriptionPrefix = var.humio_cloudwatch_logs_subscription_prefix
    EnableCloudWatchLogsBackfillerAutoRun = tostring(var.enable_cloudwatch_logs_backfiller_autorun)
    EnableVPCForIngesterLambdas = tostring(var.enable_vpc_for_ingester_lambdas)
    SecurityGroupIds = var.security_group_ids
    SubnetIds = var.subnet_ids
    HumioLambdaLogLevel = var.humio_lambda_log_level
  }

  template_body = data.local_file.cloudformation.content
}

#resource "aws_lambda_function" "logging" {
#  function_name    = "${var.app_name}-logs-to-humio"
#  filename         = local.filename
#  handler          = "index.handler"
#  runtime          = "nodejs14.x"
#  role             = aws_iam_role.logging.arn
#  source_code_hash = filebase64sha256(local.filename)
#  timeout          = var.timeout
#  memory_size      = var.memory_size
#  tags             = var.tags
#
#  environment {
#    variables = {
#      ENV                = var.app_env
#      HUMIO_INGEST_TOKEN = var.humio_ingest_token
#      SUB_IDX_NM         = var.sub_idx_nm
#    }
#  }
#
#  vpc_config {
#    security_group_ids = [aws_security_group.logging.id]
#    subnet_ids         = var.private_vpn_subnet_ids
#  }
#}
#
#resource "aws_security_group" "logging" {
#  name   = "${var.app_name}-logs-to-humio"
#  vpc_id = var.vpn_vpc_id
#
#  egress {
#    from_port        = 0
#    to_port          = 0
#    protocol         = "-1"
#    cidr_blocks      = ["0.0.0.0/0"]
#    ipv6_cidr_blocks = ["::/0"]
#  }
#}
#
#resource "aws_iam_role" "logging" {
#  name                 = "${var.app_name}-logs-to-humio-role"
#  permissions_boundary = var.role_permissions_boundary
#  assume_role_policy = jsonencode({
#    Version = "2012-10-17",
#    Statement = [
#      {
#        Action = "sts:AssumeRole",
#        Principal = {
#          Service = "lambda.amazonaws.com"
#        },
#        Effect = "Allow",
#        Sid    = ""
#      }
#    ]
#  })
#  tags = var.tags
#}
#
#resource "aws_iam_role_policy_attachment" "basic_execution" {
#  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
#  role       = aws_iam_role.logging.name
#}
#
#resource "aws_iam_role_policy_attachment" "logging_eni_attach" {
#  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaENIManagementAccess"
#  role       = aws_iam_role.logging.name
#}
#
#resource "aws_lambda_permission" "logging" {
#  for_each      = var.log_group_arns
#  action        = "lambda:InvokeFunction"
#  function_name = aws_lambda_function.logging.function_name
#  principal     = "logs.amazonaws.com"
#  source_arn    = "${each.key}:*"
#}
#
#resource "aws_cloudwatch_log_subscription_filter" "logging" {
#  for_each        = var.log_group_names
#  depends_on      = [aws_lambda_permission.logging]
#  destination_arn = aws_lambda_function.logging.arn
#  filter_pattern  = var.filter_pattern
#  log_group_name  = each.key
#  name            = "logging_default"
#}
#
#resource "aws_cloudwatch_log_group" "logging" {
#  name              = "/aws/lambda/${aws_lambda_function.logging.function_name}"
#  retention_in_days = var.log_retention_in_days
#}
