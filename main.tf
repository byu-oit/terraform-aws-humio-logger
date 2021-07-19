terraform {
  required_version = ">= 0.12.31"
  required_providers {
    aws = ">= 3.0"
  }
}

resource "aws_lambda_function" "logging" {
  function_name = "${var.app_env}-logs-to-humio"
  filename      = "${path.module}/lambda/function.zip"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  role          = aws_iam_role.logging.arn
  timeout       = var.timeout
  memory_size   = var.memory_size
  tags          = var.tags

  environment {
    variables = {
      HUMIO_INGEST_TOKEN = var.humio_ingest_token
      SUB_IDX_NM         = var.sub_idx_nm
    }
  }
}

resource "aws_iam_role" "logging" {
  name = "${var.app_env}-logs-to-humio"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })
  tags = var.tags
}

//resource "aws_iam_role_policy" "logging" {
//  name = "${var.app_name}-logs-to-humio"
//  role = aws_iam_role.logging.name
//
//  policy = jsonencode({
//    Version = "2012-10-17",
//    Statement = [
//      {
//        Action = [
//          "logs:*"
//        ],
//        Effect   = "Allow",
//        Resource = var.log_group_arns
//      }
//    ]
//  })
//}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.logging.name
}

resource "aws_lambda_permission" "logging" {
  for_each = var.log_group_arns
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.logging.function_name
  principal     = "logs.amazonaws.com"
  source_arn    = "${each.key}:*"
}

resource "aws_cloudwatch_log_subscription_filter" "logging" {
  for_each = var.log_group_names
  depends_on      = [aws_lambda_permission.logging]
  destination_arn = aws_lambda_function.logging.arn
  filter_pattern  = ""
  log_group_name  = each.key
  name            = "logging_default"
}