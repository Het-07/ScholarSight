data "aws_secretsmanager_secret" "scholarsight_secrets" {
  name        = "scholarsight-config"
  
}

resource "aws_secretsmanager_secret_version" "scholarsight_secrets_version" {
  #secret_id = aws_secretsmanager_secret.scholarsight_secrets.id
  secret_id     = data.aws_secretsmanager_secret.scholarsight_secrets.id
  secret_string = jsonencode({
    ollama_model_name = "mistral:7b"
    ollama_host       = "http://${aws_instance.app_model.private_ip}:11434"  
    qdrant_host       = "${aws_lb.qdrant_lb.dns_name}"
    qdrant_port       = "6333"
  })
}