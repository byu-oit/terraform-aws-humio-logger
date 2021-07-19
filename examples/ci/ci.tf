terraform {
  required_version = ">= 0.14.11"

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
  depends_on = [aws_cloudwatch_log_group.humio_logger]

  source                    = "../../"
  app_env                   = "dev"
  app_name                  = "humio-logger-ci"
  humio_ingest_token        = "4788f2d0-b72d-484d-944d-830aba612207"
  log_group_arns            = [aws_cloudwatch_log_group.humio_logger.arn]
  log_group_names           = [aws_cloudwatch_log_group.humio_logger.name]
  private_vpn_subnet_ids    = module.acs_vpn.private_subnet_ids
  role_permissions_boundary = module.acs_vpn.role_permissions_boundary.arn
  sub_idx_nm                = "terraform"
  vpn_vpc_id                = module.acs_vpn.vpc.id
}

resource "aws_cloudwatch_log_group" "humio_logger" {
  name = "humio-logger-ci-logs"
}

module "acs_vpn" {
  source            = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.2.0"
  vpc_vpn_to_campus = true
}