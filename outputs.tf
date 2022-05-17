output "app_env" {
  value = var.app_env
}

output "app_name" {
  value = var.app_name
}

output "humio_lambda_log_retention" {
  value = var.humio_lambda_log_retention
}

output "enable_cloudwatch_logs_auto_subscription" {
  value = var.enable_cloudwatch_logs_auto_subscription
}

output "humio_cloudwatch_logs_subscription_prefix" {
  value = var.humio_cloudwatch_logs_subscription_prefix
}

output "enable_cloudwatch_logs_backfiller_autorun" {
  value = var.enable_cloudwatch_logs_backfiller_autorun
}

output "humio_lambda_log_level" {
  value = var.humio_lambda_log_level
}

output "cloudwatch2humio_version" {
  value = var.cloudwatch2humio_version
}
