resource "aws_s3_bucket" "pdf_storage" {
  bucket = "scholarsight-pdf-storage-${random_string.bucket_suffix.result}"
  tags = {
    Name = "scholarsight-pdf-storage"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pdf_storage_encryption" {
  bucket = aws_s3_bucket.pdf_storage.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "pdf_storage_lifecycle" {
  bucket = aws_s3_bucket.pdf_storage.id
  rule {
    id     = "delete-after-1-day"
    status = "Enabled"
    filter {
      prefix = "" # Apply to all objects in the bucket
    }
    expiration {
      days = 1
    }
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}