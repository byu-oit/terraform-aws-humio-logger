locals {
  metric_conf_name            = "metric_conf.json"
  metric_statistics_conf_name = "metric_statistics_conf.json"
}

resource "local_file" "metric_conf" {
  count    = local.create_metric_ingester ? 1 : 0
  filename = "${local.source_dir}/${local.metric_conf_name}"
  content  = var.metric_conf
}

resource "local_file" "metric_statistics_conf" {
  count    = local.create_metric_statistics_ingester ? 1 : 0
  filename = "${local.source_dir}/${local.metric_statistics_conf_name}"
  content  = var.metric_statistics_conf
}

data "archive_file" "cloudwatch2humio" {
  depends_on  = [local_file.metric_conf, local_file.metric_statistics_conf]
  type        = "zip"
  source_dir  = local.source_dir
  output_path = local.archive_path
}

resource "aws_s3_bucket" "cloudwatch2humio_source_code_bucket" {
  count  = local.create_source_storage ? 1 : 0
  bucket = local.bucket_name
}

resource "aws_s3_bucket_object" "cloudwatch2humio_source_code_object" {
  count       = local.create_source_storage ? 1 : 0
  bucket      = aws_s3_bucket.cloudwatch2humio_source_code_bucket[0].bucket
  key         = local.archive_name
  source      = data.archive_file.cloudwatch2humio.output_path
  source_hash = data.archive_file.cloudwatch2humio.output_md5
}
