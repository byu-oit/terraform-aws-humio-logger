terraform {
  aws = {
    source  = "hashicorp/aws"
    version = "~> 3.0"
  }
}

provider "aws" {
  region = "us-west-2"
}

module "humio_logger" {
  source                                    = "github.com/byu-oit/terraform-aws-humio-logger?ref=v2.0.0"
  app_env                                   = "dev"
  app_name                                  = "humio-logger-ci"
  humio_cloudwatch_logs_subscription_prefix = "/humio-logger-ci/dev"
}
