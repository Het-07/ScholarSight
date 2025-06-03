output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app_model.public_ip
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.pdf_storage.bucket
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.scholarsight_metadata.name
}