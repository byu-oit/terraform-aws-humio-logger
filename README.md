![Latest GitHub Release](https://img.shields.io/github/v/release/byu-oit/terraform-aws-humio-logger?sort=semver)

# Terraform AWS Humio Logger

Infrastructure to watch a CloudWatch log group and forward its logs to Humio.

#### [New to Terraform Modules at BYU?](https://devops.byu.edu/terraform/index.html)

## Usage

### Prerequisites

Before including this module in your project, be sure to communicate with the Platform Engineer over Humio (currently 
Carson Mills) so that he can keep an updated list of the various data streams coming into Humio and who is responsible 
for them. He will also need to update filters on views to include the new SubIdxNM values so that data will be visible 
to you.

### Example

```hcl
module "humio_logger" {
  source = "github.com/byu-oit/terraform-aws-humio-logger?ref=v1.0.0"
  app_env                   = "dev"
  app_name                  = "humio-logger-ci"
  humio_ingest_token        = "4788f2d0-b72d-484d-944d-830aba612207" // This isn't a real token
  log_group_arns            = [aws_cloudwatch_log_group.humio_logger.arn]
  log_group_names           = [aws_cloudwatch_log_group.humio_logger.name]
  private_vpn_subnet_ids    = module.acs_vpn.private_subnet_ids
  role_permissions_boundary = module.acs_vpn.role_permissions_boundary.arn
  sub_idx_nm                = "payments"
  vpn_vpc_id                = module.acs_vpn.vpc.id
}
```

### Limitations

Because of [limitations with Terraform](https://www.terraform.io/docs/language/meta-arguments/for_each.html#limitations-on-values-used-in-for_each),
add this module after the initial deployment of your application to a new environment. Otherwise, you'll get an error 
similar to this:

```bash
Error: Invalid for_each argument
  on ../../main.tf line 75, in resource "aws_lambda_permission" "logging":
  75:   for_each      = var.log_group_arns

The "for_each" value depends on resource attributes that cannot be determined
until apply, so Terraform cannot predict how many instances will be created.
To work around this, use the -target argument to first apply only the
resources that the for_each depends on.
```

## Requirements

* Terraform version 0.14.11 or greater
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