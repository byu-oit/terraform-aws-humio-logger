![Latest GitHub Release](https://img.shields.io/github/v/release/byu-oit/terraform-aws-humio-logger?sort=semver)

# Terraform AWS Humio Logger

Infrastructure to watch a CloudWatch log groups and forward their logs to a Humio log repository.

#### [New to Terraform Modules at BYU?](https://devops.byu.edu/terraform/index.html)

## Usage

Before including this module in your project, you should create a new humio log repository and generate an ingest token
to pass into this module.
Read the [Ingest Tokens documentation](https://library.humio.com/cloud/docs/ingesting-data/ingest-tokens/) for more
information.

> The [ACS Info Terraform Module](https://github.com/byu-oit/terraform-aws-acs-info) provides the Humio dev and prd
> endpoints for convenience. It is recommended that you only use the prd endpoint (even for deployments of dev
> resources) because it is a stable endpoint.

### Example

```hcl
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
  image_uri                              = "ghcr.io/byu-oit/humio-logger:3" # Defaults to the same major version as the terraform module
  humio_protocol                         = "HTTP"
  # Only the http protocol is supported for the ACS-provided Humio Endpoints (as of May 26, 2022)
  humio_host                             = "${module.acs.humio_prd_endpoint}:8080" # Default is port 80
  humio_ingest_token                     = var.humio_token # Must provide this for each humio log repo
  humio_lambda_role_permissions_boundary = module.acs.role_permissions_boundary.arn
  vpc_id                                 = module.acs.vpc.id
  subnet_ids                             = module.acs.private_subnet_ids
}
```

## Requirements

* Terraform version 0.14 or greater
* AWS provider version 3.0 or greater
* BYU-ACS version 3.5.0 or greater

## Inputs

| Name                                   | Type         | Description                                                                                                                                                                                                                                                                                                                                                                 | Default         |
|----------------------------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| app_name                               | string       | The application name to include in the name of resources created.                                                                                                                                                                                                                                                                                                           |                 |
| humio_protocol                         | string       | The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended.                                                                                                                                                                                                                                                                    | HTTPS           |
| humio_host                             | string       | The host to ship Humio log/metric events to.                                                                                                                                                                                                                                                                                                                                | cloud.humio.com |
| humio_ingest_token (sensitive)         | string       | The value of the ingest token for the repository from your Humio account to ship log/metric events to.                                                                                                                                                                                                                                                                      | ""              |
| humio_lambda_log_retention             | number       | Number of days to retain CloudWatch logs from the Humio Lambda functions.                                                                                                                                                                                                                                                                                                   | 1               |
| humio_lambda_role_permissions_boundary | string       | The ARN of the role permissions boundary to attach to the Humio Lambda role.                                                                                                                                                                                                                                                                                                | ""              |
| logs_subscriptions                     | list(string) | Subscribes the log ingester lambda to each log group listed.                                                                                                                                                                                                                                                                                                                | []              |
| metric_conf                            | string       | A stringified metric configuration to pass into the [CloudWatch GetMetricData command](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-data.html). This configuration will be uploaded to the s3 bucket. An example configuration is located in the `examples/static` directory of this repository.                                                  | ""              |
| metric_statistics_conf                 | string       | A stringified list of metric statistics configurations that will each be passed into the [CloudWatch GetMetricStatistics command](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html). This configuration will be uploaded to the s3 bucket. An example configuration is located in the `examples/static` directory of this repository. | ""              |
| log_level                              | string       | The log level for the Humio lambdas.                                                                                                                                                                                                                                                                                                                                        | INFO            |
| s3_bucket                              | string       | The name of the S3 bucket where your lambda ingester code is located. If none is specified, a bucket will be created with the name `<app_name>-humio-logger`                                                                                                                                                                                                                | ""              |
| vpc_id                                 | string       | Use a VPC for the lambda ingester functions. Pass in a VPC ID to deploy the ingester lambdas in the VPC.                                                                                                                                                                                                                                                                    | ""              |
| security_group_ids                     | list(string) | A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled.                                                                                                                                                                                                                                            | []              |
| subnet_ids                             | list(string) | A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled.                                                                                                                                                                                                                               | []              |

## Outputs

In addition to all non-sensitive arguments above, the following attributes are exported:

| Name                       | Type                                                                                                                               | Description                                                                                                                    |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| log_ingester               | [object](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function#attributes-reference)         | A aws_lambda_function object                                                                                                   |
| metric_ingester            | [object](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function#attributes-reference) or null | When a metric configuration is provided the output will be a aws_lambda_function object, otherwise it will be null.            |
| metric_statistics_ingester | [object](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function#attributes-reference) or null | When a metric statistics configuration is provided the output will be a aws_lambda_function object, otherwise it will be null. |

## Deployment

1. Create a PR and merge changes to the main branch after checks pass and a code owner reviews the changes.
2. Push `latest`, `major`, `minor`, and `patch` tags (
   following [the semantic versioning specification](https://semver.org)) to publish a new Docker images with those
   tags. For example:
   ```shell
   # Create new tags
   git tag latest 1 1.2 1.2.3
   
   # Update and list tags to verify
   git fetch --tags --all
   git tag --list
   
   # Push all tags
   git push --tags
   ```
   Pushing tags triggers the publish workflow in the `.github/workflows` directory which publishes the Docker image to
   the GitHub Container Registry with the respective tag.
3. Publish a new release in GitHub:
    1. Target the new version tag.
    2. Name the release after the latest tag name.
    3. List the changes made.
