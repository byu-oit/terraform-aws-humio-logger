output "app_name" {
  value = var.app_name
}

output "humio_protocol" {
  value = var.humio_protocol
}

output "humio_host" {
  value = var.humio_host
}

output "humio_lambda_log_retention" {
  value = var.humio_lambda_log_retention
}

output "humio_lambda_role_permissions_boundary" {
  value = var.humio_lambda_role_permissions_boundary
}

output "logs_subscriptions" {
  value = var.logs_subscriptions
}

output "metric_conf" {
  value = var.metric_conf
}

output "metric_rate_expression" {
  value = var.metric_rate_expression
}

output "metric_statistics_conf" {
  value = var.metric_statistics_conf
}

output "metric_statistics_rate_expression" {
  value = var.metric_statistics_rate_expression
}

output "log_level" {
  value = var.log_level
}

output "s3_bucket" {
  value = local.bucket_name
}

output "vpc_id" {
  value = var.vpc_id
}

output "security_group_ids" {
  value = var.security_group_ids
}

output "subnet_ids" {
  value = var.subnet_ids
}
