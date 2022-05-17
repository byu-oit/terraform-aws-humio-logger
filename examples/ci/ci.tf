terraform {
  required_version = ">= 0.12.17"

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

module "ci_test" {
  source                                    = "../../"
  app_env                                   = "dev"
  app_name                                  = "humio-logger-ci"
  humio_cloudwatch_logs_subscription_prefix = "/humio-logger-ci/dev"
}
