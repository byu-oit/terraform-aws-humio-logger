terraform {
  required_version = ">= 0.14"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.15"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

variable "humio_token" {
  type        = string
  description = "The Humio ingest token to use for shipping logs to Humio from the cloudwatch ingest lambda."
  sensitive   = true
}

module "acs" {
  source            = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.5.0"
  vpc_vpn_to_campus = true
}

module "humio_logger" {
  source                 = "github.com/byu-oit/terraform-aws-humio-logger?ref=v3.0.6"
  app_name               = "humio-logger-ci-dev"
  logs_subscriptions     = ["/humio-logger-ci/dev"]
  metric_conf            = file("../static/conf_metric_ingester.json")
  metric_statistics_conf = file("../static/conf_metric_statistics_ingester.json")
  vpc_id                 = module.acs.vpc.id
  subnet_ids             = module.acs.private_subnet_ids
  humio_protocol         = "HTTP"
  humio_host             = "example.com"
  humio_ingest_token     = var.humio_token
}
