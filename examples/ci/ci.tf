terraform {
  required_version = ">= 0.12.0"
}

provider "aws" {
  version = "~> 2.42"
  region  = "us-west-2"
}

module "ci_test" {
  source = "../../"
}
