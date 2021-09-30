variable "app_env" {
  type        = string
  description = "The environment of the application. Used to determine what instance of Humio to send log data to."
}

variable "app_name" {
  type        = string
  description = "The application name to include in the name of resources created."
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

variable "log_retention_in_days" {
  type        = number
  description = "The number of days to retain logs for the logs-to-humio Lambda."
  default     = 7
}

variable "memory_size" {
  type        = number
  description = "The amount of memory for the function."
  default     = 128
}

variable "private_vpn_subnet_ids" {
  type        = list(string)
  description = "A list of subnet IDs in the private subnet of the VPN VPC."
}

variable "role_permissions_boundary" {
  type        = string
  description = "The ARN of the role permissions boundary to attach to the Lambda role."
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

variable "vpn_vpc_id" {
  type        = string
  description = "The ID of the VPC with a VPN back to campus."
}

variable "filter_pattern" {
  type        = string
  description = "(Optional) A valid CloudWatch Logs filter pattern for subscribing to a filtered stream of log events"
  default     = ""
}