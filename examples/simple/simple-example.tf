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
  source                                 = "github.com/byu-oit/terraform-aws-humio-logger?ref=v3.0.0"
  app_name                               = "humio-logger-ci-dev"
  image_uri                              = "ghcr.io/byu-oit/humio-logger:3"
  humio_protocol                         = "HTTP"
  humio_host                             = "${module.acs.humio_prd_endpoint}:8080"
  humio_ingest_token                     = var.humio_token
  humio_lambda_role_permissions_boundary = module.acs.role_permissions_boundary.arn
  vpc_id                                 = module.acs.vpc.id
  subnet_ids                             = module.acs.private_subnet_ids
}
