locals {
  humio_cloudwatch_role = {
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "apigateway.amazonaws.com",
            "logs.amazonaws.com",
            "events.amazonaws.com"
          ]
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  }

  humio_cloudwatch_ingester_lambdas_in_vpc = {
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "lambda:GetFunction",
          "lambda:InvokeFunction",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:DescribeSubscriptionFilters",
          "logs:PutSubscriptionFilter",
          "logs:DeleteSubscriptionFilter",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterfacePermission",
          "ec2:DeleteNetworkInterface"
        ],
        Resource = "*"
      }
    ]
  }

  humio_cloudwatch_ingester_lambdas = {
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "lambda:GetFunction",
          "lambda:InvokeFunction",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:DescribeSubscriptionFilters",
          "logs:PutSubscriptionFilter",
          "logs:DeleteSubscriptionFilter",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics"
        ],
        Resource = "*"
      }
    ]
  }
}

resource "aws_iam_role" "humio_cloudwatch_role" {
  assume_role_policy = jsonencode(local.humio_cloudwatch_role)

  inline_policy {
    name   = "HumioCloudwatchIngesterLambdas"
    policy = local.enable_vpc_for_ingester_lambdas ? jsonencode(local.humio_cloudwatch_ingester_lambdas_in_vpc) : jsonencode(local.humio_cloudwatch_ingester_lambdas)
  }

  permissions_boundary = local.add_permission_boundary ? var.humio_lambda_role_permissions_boundary : null
}
