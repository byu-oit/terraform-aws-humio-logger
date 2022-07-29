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

output "metric_statistics_conf" {
  value = var.metric_statistics_conf
}

output "log_level" {
  value = var.log_level
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

output "image_uri" {
  value = var.image_uri
}

output "log_ingester" {
  value     = aws_lambda_function.humio_cloudwatch_log_ingester
  sensitive = true
}

output "metric_ingester" {
  value     = local.create_metric_ingester ? aws_lambda_function.humio_cloudwatch_metric_ingester[0] : null
  sensitive = true
}

output "metric_statistics_ingester" {
  value     = local.create_metric_statistics_ingester ? aws_lambda_function.humio_cloudwatch_metric_statistics_ingester[0] : null
  sensitive = true
}
