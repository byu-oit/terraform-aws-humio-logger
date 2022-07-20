resource "aws_cloudwatch_log_subscription_filter" "humio_cloudwatch_log_ingester_subscriptions" {
  for_each        = toset(var.logs_subscriptions)
  name            = "subscription${each.key}"
  log_group_name  = each.key
  filter_pattern  = ""
  distribution    = "ByLogStream"
  destination_arn = aws_lambda_function.humio_cloudwatch_log_ingester.arn
}
