output "app_env" {
  value = var.app_env
}

output "app_name" {
  value = var.app_name
}

output "humio_protocol" {
  value = var.humio_protocol
}

output "humio_host" {
  value = var.humio_host
}

output "humio_ingest_token" {
  value = var.humio_ingest_token
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

output "enable_vpc_for_ingester_lambdas" {
  value = var.enable_vpc_for_ingester_lambdas
}

output "security_group_ids" {
  value = var.security_group_ids
}

output "subnet_ids" {
  value = var.subnet_ids
}

output "humio_lambda_log_level" {
  value = var.humio_lambda_log_level
}
