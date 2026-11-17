terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.77.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

module "humio_logger" {
  source             = "../.."
  app_name           = "humio-logger-provider5-compat"
  logs_subscriptions = ["/humio-logger-provider5-compat"]
  humio_ingest_token = "fake-token"
  lambda_runtime     = "nodejs22.x"
}
