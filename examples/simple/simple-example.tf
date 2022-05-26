terraform {
  required_version = ">= 0.14"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

variable "humio_dev_token" {
  type        = string
  description = "The Humio ingest token to use for shipping logs to Humio from the cloudwatch ingest lambda."
  sensitive   = true
}

module "acs" {
  source            = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.5.0"
  vpc_vpn_to_campus = true
}

module "humio_logger" {
  source                                    = "github.com/byu-oit/terraform-aws-humio-logger?ref=v2.0.0"
  app_name                                  = "humio-logger-ci-dev"
  humio_cloudwatch_logs_subscription_prefix = "/humio-logger-ci/dev"
  vpc_id                                    = module.acs.vpc.id
  subnet_ids                                = module.acs.private_subnet_ids
  humio_host                                = module.acs.humio_dev_endpoint
  humio_ingest_token                        = var.humio_dev_token
}
