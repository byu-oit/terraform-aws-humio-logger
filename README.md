![Latest GitHub Release](https://img.shields.io/github/v/release/byu-oit/terraform-aws-humio-logger?sort=semver)

# Terraform AWS Humio Logger

Infrastructure to watch a CloudWatch log groups and forward their logs to a Humio log repository. This modules wraps the
[Humio Log Shipper Cloudformation template](https://github.com/humio/cloudwatch2humio/cloudformation-no-trail.json). *It
does not create CloudTrail resources.* Please file issues in the code and infrastructure there unless the issue is
related to terraform.

#### [New to Terraform Modules at BYU?](https://devops.byu.edu/terraform/index.html)

## Usage

Before including this module in your project, you should create a new humio log repository and generate an ingest token
to pass into this module.
Read the [Ingest Tokens documentation](https://library.humio.com/cloud/docs/ingesting-data/ingest-tokens/) for more
information.

> The [ACS Info Terraform Module](https://github.com/byu-oit/terraform-aws-acs-info) provides the Humio dev and prd
> endpoints for convenience. It is recommended that you only use the prd endpoint (even for deployments of dev
> resources) because it is a stable endpoint.

If you only want specific log groups to be ingested into Humio, you can use the `HumioCloudWatchLogsSubscriber` as this
only subscribes the log ingester to one log group at a time. If you want to subscribe to all log groups available, you
can use the `HumioCloudWatchBackfiller`. If you have set the `EnableCloudWatchLogsBackfillerAutoRun` parameter to true
when creating the stack, then you will _not_ have to manually trigger it as it should already have run on creation and
subscribed the log ingester to all available log groups. Otherwise, both lambdas can be enabled using test events.

For the `HumioCloudWatchLogsSubscriber` lambda, configure your test event like the example below with “EXAMPLE”
representing an actual log group, and click Test.

```json
{
  "detail": {
    "requestParameters": {
      "logGroupName": "EXAMPLE"
    }
  }
}
```

For the `HumioCloudWatchLogsBackfiller` lambda, use the default test event and click Test. This might take a while
depending on the number of log groups that you are subscribing to.

[For more troubleshooting information, read the documentation.](https://library.humio.com/reference/log-formats/amazon-cloudwatch/#configuring-the-integration)
provided by Humio about this integration.

### Example

```hcl
module "acs" {
  source            = "github.com/byu-oit/terraform-aws-acs-info?ref=v3.5.0"
  vpc_vpn_to_campus = true
}

module "humio_logger" {
  source                                    = "github.com/byu-oit/terraform-aws-humio-logger?ref=v2.0.0"
  app_name                                  = "humio-logger-ci-dev"
  humio_cloudwatch_logs_subscription_prefix = "/humio-logger-ci/dev"
  vpc_id                                    = module.acs.vpc.id
  subnet_ids                                = module.acs.private_subnet_ids
  humio_protocol                            = "HTTP"
  # Only the http protocol is supported for the ACS-provided Humio Endpoints (as of May 26, 2022)
  humio_host                                = "${module.acs.humio_prd_endpoint}:8080" # Default is port 80
  humio_ingest_token                        = var.humio_dev_token # Must provide this for each humio log repo
  humio_lambda_role_permissions_boundary    = module.acs.role_permissions_boundary.arn
  enable_cloudwatch_logs_auto_subscription  = true
  enable_cloudwatch_logs_backfiller_autorun = true
}
```

## Requirements

* Terraform version 0.14 or greater
* AWS provider version 3.0 or greater
* BYU-ACS version 3.5.0 or greater

## Inputs

| Name                                      | Type         | Description                                                                                                                                                                                     | Default         |
|-------------------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| app_name                                  | string       | The application name to include in the name of resources created.                                                                                                                               |                 |
| humio_protocol                            | string       | The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended.                                                                                        | HTTPS           |
| humio_host                                | string       | The host to ship Humio log/metric events to.                                                                                                                                                    | cloud.humio.com |
| humio_ingest_token                        | string       | The value of the ingest token for the repository from your Humio account to ship log/metric events to.                                                                                          | ""              |
| humio_lambda_log_retention                | number       | Number of days to retain CloudWatch logs from the Humio Lambda functions.                                                                                                                       | 1               |
| humio_lambda_role_permissions_boundary    | string       | The ARN of the role permissions boundary to attach to the Humio Lambda role.                                                                                                                    | ""              |
| enable_cloudwatch_logs_auto_subscription  | bool         | Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable.                                                 | true            |
| humio_cloudwatch_logs_subscription_prefix | string       | Humio will only subscribe to log groups with the prefix specified.                                                                                                                              | ""              |
| enable_cloudwatch_logs_backfiller_autorun | bool         | Make the backfiller run automatically when created. Set to 'true' to enable. Enabling the backfiller will [delete existing subscriptions](https://github.com/humio/cloudwatch2humio/issues/31). | false           |
| vpc_id                                    | string       | Use a VPC for the lambda ingester functions. Pass in a vpc to enable.                                                                                                                           | ""              |
| security_group_ids                        | list(string) | A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled.                                                                | []              |
| subnet_ids                                | list(string) | A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled.                                                   | []              |
| humio_lambda_log_level                    | string       | The log level for the Humio lambdas. (DEBUG, INFO, WARNING, ERROR, CRITICAL)                                                                                                                    | "INFO"          |
| cloudwatch2humio_version                  | string       | The version of the integration to be installed. Available releases can be found under releases in the GitHub repository.                                                                        | v1.2.1          |

## Outputs

| Name                                      | Type         | Description                                                                                                                                     |
|-------------------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| app_name                                  | string       | The application name to include in the name of resources created.                                                                               |
| humio_protocol                            | string       | The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended.                                        |
| humio_host                                | string       | The host to ship Humio log/metric events to.                                                                                                    |
| humio_ingest_token                        | string       | The value of the ingest token for the repository from your Humio account to ship log/metric events to.                                          |
| humio_lambda_log_retention                | number       | Number of days to retain CloudWatch logs from the Humio Lambda functions.                                                                       |
| humio_lambda_role_permissions_boundary    | string       | The ARN of the role permissions boundary to attach to the Humio Lambda role.                                                                    |
| enable_cloudwatch_logs_auto_subscription  | bool         | Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable. |
| humio_cloudwatch_logs_subscription_prefix | string       | Humio will only subscribe to log groups with the prefix specified.                                                                              |
| enable_cloudwatch_logs_backfiller_autorun | bool         | Make the backfiller run automatically when created. Set to 'true' to enable.                                                                    |
| vpc_id                                    | string       | Use a VPC for the lambda ingester functions. Pass in a vpc to enable.                                                                           |
| security_group_ids                        | list(string) | A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled.                |
| subnet_ids                                | list(string) | A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled.   |
| humio_lambda_log_level                    | string       | The log level for the Humio lambdas. (DEBUG, INFO, WARNING, ERROR, CRITICAL)                                                                    |
| cloudwatch2humio_version                  | string       | The version of the integration to be installed. When creating a new stack.                                                                      |

## Deployment

Push changes to the main branch and create a new release of the humio logger
following [the semantic versioning specification](https://semver.org).

## Development

To update to the latest version of Cloudwatch2Humio:

1. Clone the git repository: [https://github.com/humio/cloudwatch2humio](https://github.com/humio/cloudwatch2humio)
2. Copy the `$PROJECT/cloudformation.json` file to this project replacing the old cloudformation template. This file
   should not be modified except to add the PermissionsBoundary to the HumioCloudWatchRole.
3. Ensure that the necessary refactors are implemented in terraform.
