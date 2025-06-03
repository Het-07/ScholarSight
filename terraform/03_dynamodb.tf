resource "aws_dynamodb_table" "scholarsight_metadata" {
  name           = "scholarsight-metadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "document_id"
  attribute {
    name = "document_id"
    type = "S"
  }
  tags = {
    Name = "scholarsight-metadata"
  }
}