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

* Terraform version 0.12.31 or greater
* AWS provider version 3.0 or greater

## Inputs

| Name | Type  | Description | Default |
| --- | --- | --- | --- |
| app_env | string | The environment of the application. Used to determine what instance of Humio to send log data to. |
| app_name | string | The application name to include in the name of resources created. |
| humio_ingest_token | string (sensitive) | The ingest token for Humio logs. |
| log_group_arns | set(string) | The ARNs of CloudWatch log groups that should be forwarded to Humio. |
| log_group_names | set(string) | The names of the CloudWatch log groups that should be forwarded to Humio. |
| memory_size | number | The amount of memory for the function. | 128 |
| private_vpn_subnet_ids | list(string) | A list of subnet IDs in the private subnet of the VPN VPC. |
| role_permissions_boundary | string | The ARN of the role permissions boundary to attach to the Lambda role. |
| sub_idx_nm | string | The SubIdxNM for the application in Humio. |
| timeout | number | The amount of time the function is allowed to run. | 30 |
| tags | map(string) | A map of AWS Tags to attach to each resource created. | {} |

## Outputs

| Name | Type | Description |
| ---  | ---  | --- |
| function_name | string | The name of the logs-to-Humio function. |

## Deployment

If you update the Lambda function code, be sure to run `zip -r function.zip .` in the `lambda` folder.