variable "app_name" {
  type        = string
  description = "The application name to include in the name of resources created."
}

variable "app_env" {
  type        = string
  description = "The environment of the application. Used to determine what instance of Humio to send log data to."
}

// TODO Move to ACS as SSM parameter
variable "humio_ingest_token" {
  type        = string
  description = "The ingest token for Humio logs."
  sensitive   = true
}

variable "log_group_arns" {
  type        = set(string)
  description = "The ARNs of CloudWatch log groups that should be forwarded to Humio."
}

variable "log_group_names" {
  type        = set(string)
  description = "The names of the CloudWatch log groups that should be forwarded to Humio."
}

variable "memory_size" {
  type        = number
  description = "The amount of memory for the function."
  default     = 128
}

variable "sub_idx_nm" {
  type        = string
  description = "The SubIdxNM for the application in Humio."
}

variable "timeout" {
  type        = number
  description = "The amount of time the function is allowed to run."
  default     = 30
}

variable "tags" {
  type        = map(string)
  description = "A map of AWS Tags to attach to each resource created."
  default     = {}
}
