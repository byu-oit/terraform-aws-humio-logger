![Latest GitHub Release](https://img.shields.io/github/v/release/byu-oit/terraform-aws-humio-logger?sort=semver)

# Terraform AWS Humio Logger

Infrastructure to watch a CloudWatch log group and forward its logs to Humio.

#### [New to Terraform Modules at BYU?](https://devops.byu.edu/terraform/index.html)

## Usage

```hcl
module "humio_logger" {
  source = "github.com/byu-oit/terraform-aws-humio-logger?ref=v1.0.0"
}
```
## Requirements

* Terraform version 0.12.0 or greater

## Inputs

| Name | Type  | Description | Default |
| --- | --- | --- | --- |
| | | | |

## Outputs

| Name | Type | Description |
| ---  | ---  | --- |
| | | |

## Assumptions

* CloudWatch logs are JSON formatted
* Logs are not encrypted

## TODO

* Add KMS integration to support encrypted CloudWatch logs
* Translate non-JSON logs for Humio
* Use global SSM param
* Add ADR and roadmpa