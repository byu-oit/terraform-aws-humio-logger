resource "aws_s3_bucket" "cloudwatch2humio_source_code_bucket" {
  count  = local.create_source_storage ? 1 : 0
  bucket = local.bucket_name
}

resource "aws_s3_bucket_object" "cloudwatch2humio_source_code_object" {
  count       = local.create_source_storage ? 1 : 0
  bucket      = aws_s3_bucket.cloudwatch2humio_source_code_bucket[0].bucket
  key         = local.archive_name
  source      = local.archive_path
  source_hash = filemd5(local.archive_path)
}
