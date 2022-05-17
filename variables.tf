variable "app_env" {
  type        = string
  description = "The environment of the application. Used to determine what instance of Humio to send log data to."
}

variable "app_name" {
  type        = string
  description = "The application name to include in the name of resources created."
}

variable "humio_lambda_log_retention" {
  type        = number
  description = "Number of days to retain CloudWatch logs from the Humio Lambda functions."
  default     = 1
}

variable "enable_cloudwatch_logs_auto_subscription" {
  type        = bool
  description = "Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable."
  default     = false
}

variable "humio_cloudwatch_logs_subscription_prefix" {
  type        = string
  description = "Humio will only subscribe to log groups with the prefix specified."
  default     = "" // Defaults to all log groups
}

variable "enable_cloudwatch_logs_backfiller_autorun" {
  type        = bool
  description = "Make the backfiller run automatically when created. Set to 'true' to enable."
  default     = false
}

variable "humio_lambda_log_level" {
  type        = string
  description = "The log level for the Humio lambdas."
  validation {
    condition     = contains(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], var.humio_lambda_log_level)
    error_message = "Must be one of ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']."
  }
  default = "INFO"
}
