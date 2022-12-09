resource "aws_s3_bucket" "cloudwatch2humio_source_code_bucket" {
  count  = local.create_source_storage ? 1 : 0
  bucket = local.bucket_name

  lifecycle_rule {
    enabled                                = true
    abort_incomplete_multipart_upload_days = 10
    id                                     = "AutoAbortFailedMultipartUpload"

    expiration {
      days                         = 0
      expired_object_delete_marker = false
    }
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_object" "cloudwatch2humio_source_code_object" {
  count       = local.create_source_storage ? 1 : 0
  depends_on  = [aws_s3_bucket.cloudwatch2humio_source_code_bucket]
  bucket      = aws_s3_bucket.cloudwatch2humio_source_code_bucket[0].bucket
  key         = local.archive_name
  source      = local.archive_path
  source_hash = filemd5(local.archive_path)
}

data "aws_s3_bucket_object" "cloudwatch2humio_source_code_object" {
  depends_on = [aws_s3_bucket_object.cloudwatch2humio_source_code_object]
  bucket     = local.create_source_storage ? aws_s3_bucket.cloudwatch2humio_source_code_bucket[0].bucket : local.bucket_name
  key        = local.archive_name
}
