resource "aws_lambda_function" "humio_cloudwatch_metric_ingester" {
  count         = local.create_metric_ingester ? 1 : 0
  depends_on    = [aws_iam_role.humio_cloudwatch_role, aws_s3_bucket_object.cloudwatch2humio_source_code_object]
  description   = "CloudWatch Metrics to Humio ingester"
  function_name = "${var.app_name}-metric-ingester" // lambda names have a max length of 140 characters
  s3_bucket     = local.bucket_name
  s3_key        = local.archive_name
  environment {
    variables = {
      HUMIO_PROTOCOL     = var.humio_protocol
      HUMIO_HOST         = var.humio_host
      HUMIO_INGEST_TOKEN = var.humio_ingest_token
      LOG_LEVEL          = var.log_level
      CONF_NAME          = local.metric_conf_name
    }
  }
  vpc_config {
    security_group_ids = local.enable_vpc_for_ingester_lambdas ? var.security_group_ids : []
    subnet_ids         = local.enable_vpc_for_ingester_lambdas ? var.subnet_ids : []
  }
  handler     = "metric_ingester.handler"
  memory_size = 128
  role        = aws_iam_role.humio_cloudwatch_role.arn
  runtime     = "nodejs16.x"
  timeout     = 300
}

resource "aws_lambda_permission" "humio_cloudwatch_metric_ingester_permission" {
  count         = local.create_metric_ingester ? 1 : 0
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.humio_cloudwatch_metric_ingester[0].function_name
  principal     = "logs.amazonaws.com"
}

resource "aws_cloudwatch_log_group" "humio_cloudwatch_metric_ingester_log_group" {
  count             = local.create_metric_ingester ? 1 : 0
  name              = "/aws/lambda/${aws_lambda_function.humio_cloudwatch_metric_ingester[0].function_name}"
  retention_in_days = var.humio_lambda_log_retention
}
