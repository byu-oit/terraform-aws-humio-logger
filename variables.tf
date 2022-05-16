variable "app_env" {
  type        = string
  description = "The environment of the application. Used to determine what instance of Humio to send log data to."
}

variable "app_name" {
  type        = string
  description = "The application name to include in the name of resources created."
}

variable "humio_protocol" {
  type = string
  description = "The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended."
  default = "https"
}

variable "humio_host" {
  type = string
  description = "The host to ship Humio log/metric events to."
}

variable "humio_ingest_token" {
  type = string
  description = "The value of the ingest token for the repository from your Humio account to ship log/metric events to."
  sensitive = true
}

variable "humio_lambda_log_retention" {
  type = number
  description = "Number of days to retain CloudWatch logs from the Humio Lambda functions."
  default = 1
}

variable "enable_cloudwatch_logs_auto_subscription" {
  type = bool
  description = "Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable."
  default = false
}

variable "humio_cloudwatch_logs_subscription_prefix" {
  type = string
  description = "Humio will only subscribe to log groups with the prefix specified."
  default = ""
}

variable "enable_cloudwatch_logs_backfiller_autorun" {
  type = bool
  description = "Make the backfiller run automatically when created. Set to 'true' to enable."
  default = false
}

variable "enable_vpc_for_ingester_lambdas" {
  type = bool
  description = "Use a VPC for the lambda ingester functions. Set to 'true' to enable."
  default = false // TODO - coerce to string in parameter map
}

variable "security_group_ids" {
  type = list(string)
  description = "A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled."
  default = []
}

variable "subnet_ids" {
  type = list(string)
  description = "A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled."
  default = []
}

variable "humio_lambda_log_level" {
  type = string
  description = "The log level for the Humio lambdas."
  validation {
    condition = contains(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], var.humio_lambda_log_level)
    error_message = "Must be one of ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']."
  }
  default = "INFO"
}
