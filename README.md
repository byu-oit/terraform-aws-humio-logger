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
  source                                    = "github.com/byu-oit/terraform-aws-humio-logger?ref=v2.0.0"
  app_env                                   = "dev"
  app_name                                  = "humio-logger-ci"
  humio_cloudwatch_logs_subscription_prefix = "/humio-logger-ci/dev"
}
```

## Requirements

* Terraform version 0.14 or greater
* AWS provider version 3.0 or greater

## Inputs

| Name                                      | Type         | Description                                                                                                                                                                                  | Default |
|-------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| app_env                                   | string       | The environment of the application. Used to determine what instance of Humio to send log data to.                                                                                            |         |
| app_name                                  | string       | The application name to include in the name of resources created.                                                                                                                            |         |
| humio_protocol                            | string       | The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended.                                                                                     |         |
| humio_host                                | string       | The host to ship Humio log/metric events to.                                                                                                                                                 |         |
| humio_ingest_token                        | string       | The value of the ingest token for the repository from your Humio account to ship log/metric events to.                                                                                       |         |
| humio_lambda_log_retention                | number       | Number of days to retain CloudWatch logs from the Humio Lambda functions.                                                                                                                    | 1       |
| enable_cloudwatch_logs_auto_subscription  | bool         | Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable.                                              | false   |
| humio_cloudwatch_logs_subscription_prefix | string       | Humio will only subscribe to log groups with the prefix specified.                                                                                                                           | ""      |
| enable_cloudwatch_logs_backfiller_autorun | bool         | Make the backfiller run automatically when created. Set to 'true' to enable.                                                                                                                 | false   |
| vpc_id                                    | string       | Use a VPC for the lambda ingester functions. Pass in a vpc to enable.                                                                                                                        |         |
| security_group_ids                        | list(string) | A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled.                                                             |         |
| subnet_ids                                | list(string) | A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled.                                                |         |
| humio_lambda_log_level                    | string       | The log level for the Humio lambdas. (DEBUG, INFO, WARNING, ERROR, CRITICAL)                                                                                                                 | "INFO"  |
| cloudwatch2humio_version                  | string       | The version of the integration to be installed. When creating a new stack, the default value is the newest version. Available releases can be found under releases in the GitHub repository. |

## Outputs

| Name                                      | Type         | Description                                                                                                                                                                                  | Default |
|-------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| app_env                                   | string       | The environment of the application. Used to determine what instance of Humio to send log data to.                                                                                            |         |
| app_name                                  | string       | The application name to include in the name of resources created.                                                                                                                            |         |
| humio_protocol                            | string       | The transport protocol used for delivering log/metric events to Humio. HTTPS is default and recommended.                                                                                     |         |
| humio_host                                | string       | The host to ship Humio log/metric events to.                                                                                                                                                 |         |
| humio_ingest_token                        | string       | The value of the ingest token for the repository from your Humio account to ship log/metric events to.                                                                                       |         |
| humio_lambda_log_retention                | number       | Number of days to retain CloudWatch logs from the Humio Lambda functions.                                                                                                                    | 1       |
| enable_cloudwatch_logs_auto_subscription  | bool         | Make the log ingester automatically subscribe to new log groups specified with the logs subscription prefix parameter. Set to 'true' to enable.                                              | false   |
| humio_cloudwatch_logs_subscription_prefix | string       | Humio will only subscribe to log groups with the prefix specified.                                                                                                                           | ""      |
| enable_cloudwatch_logs_backfiller_autorun | bool         | Make the backfiller run automatically when created. Set to 'true' to enable.                                                                                                                 | false   |
| vpc_id                                    | string       | Use a VPC for the lambda ingester functions. Pass in a vpc to enable.                                                                                                                        |         |
| security_group_ids                        | list(string) | A list of security group ids for the VPC configuration regarding the ingester lambda functions. Only required if VPC is enabled.                                                             |         |
| subnet_ids                                | list(string) | A list of subnet ids used by the VPC configuration that the ingester lambda functions will be deployed into. Only required if VPC is enabled.                                                |         |
| humio_lambda_log_level                    | string       | The log level for the Humio lambdas. (DEBUG, INFO, WARNING, ERROR, CRITICAL)                                                                                                                 | "INFO"  |
| cloudwatch2humio_version                  | string       | The version of the integration to be installed. When creating a new stack, the default value is the newest version. Available releases can be found under releases in the GitHub repository. |

## Deployment

If you update the Lambda function code, be sure to run `zip -r function.zip .` in the `lambda` folder.

## Development

To update to the latest version of Cloudwatch2Humio:

1. Clone the git repository: [https://github.com/humio/cloudwatch2humio](https://github.com/humio/cloudwatch2humio)
2. Copy the `$PROJECT/cloudformation.json` file to this project replacing the old cloudformation template. This file
   should not be modified.
3. Ensure that the necessary refactors are implemented in terraform.
