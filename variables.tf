variable "app_name" {
  type        = string
  description = "The application name to include in the name of resources created."
}

variable "humio_protocol" {
  type        = string
  description = "The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended."
  validation {
    condition     = contains(["HTTPS", "HTTP"], var.humio_protocol)
    error_message = "Must be one of ['HTTPS', 'HTTP']."
  }
  default = "HTTPS"
}

variable "humio_host" {
  type        = string
  description = "The host to ship Humio log/metric events to."
  default     = "cloud.humio.com"
}

variable "humio_ingest_token" {
  type        = string
  description = "The value of the ingest token for the repository from your Humio account to ship log/metric events to."
  default     = ""
  sensitive   = true
}

variable "humio_lambda_log_retention" {
  type        = number
  description = "Number of days to retain CloudWatch logs from the Humio Lambda functions."
  default     = 1
}

variable "humio_lambda_role_permissions_boundary" {
  type        = string
  description = "The ARN of the role permissions boundary to attach to the Humio Lambda role."
  default     = ""
}

variable "logs_subscriptions" {
  // Pass in a set of aws_cloudwatch_log_group resource
  type        = list(string)
  description = "Humio will only subscribe to the log groups specified."
  default     = []
}

variable "metric_conf" {
  type        = string
  description = "Humio will only subscribe to the metrics specified."
  default     = ""
}

variable "metric_statistics_conf" {
  type        = string
  description = "Humio will only subscribe to the metric statistics specified."
  default     = ""
}

variable "log_level" {
  type        = string
  description = "The log level for the Humio lambdas."
  validation {
    condition     = contains(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], var.log_level)
    error_message = "Must be one of ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']."
  }
  default = "INFO"
}

variable "s3_bucket" {
  type        = string
  description = "The name of the S3 bucket where your lambda ingester code is located."
  default     = ""
}

variable "vpc_id" {
  type        = string
  description = "Use a VPC for the lambda ingester functions. Pass in a vpc to enable."
  default     = ""
}

variable "security_group_ids" {
  type        = list(string)
  description = "A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled."
  default     = []
}

variable "subnet_ids" {
  type        = list(string)
  description = "A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled."
  default     = []
}
