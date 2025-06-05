resource "aws_security_group" "ec2_sg" {
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 11434
    to_port     = 11434
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  ingress {
    from_port   = 6333
    to_port     = 6333
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "scholarsight-ec2-sg"
  }
}

resource "aws_instance" "app_model" {
  ami                    = "ami-0953476d60561c955"
  instance_type          = "t3.xlarge"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  associate_public_ip_address = true
    iam_instance_profile = aws_iam_instance_profile.llm_instance_profile.name
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = <<-EOF
                    #!/bin/bash
                    set -e

                    # Log to a file for debugging
                    exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

                    echo "Updating system packages..."
                    yum update -y

                    # Install and configure Docker
                    echo "Installing Docker..."
                    yum install -y docker
                    systemctl start docker
                    systemctl enable docker

                     

                    # Install AWS CLI and jq if not already installed
                    echo "Installing AWS CLI and jq..."
                    yum install -y aws-cli jq

                    # Fetching the secrets 
                    echo "Retrieving secrets from Secrets Manager..."
                    SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id scholarsight-config --region us-east-1 | jq -r '.SecretString')
                    
                    # Extract environment variables from secret JSON
                    echo "DEBUG: Secret JSON content:"
                    echo "$SECRET_JSON" | jq '.'
                    
                    # Set environment variables with default fallbacks if not found
                    ollama_host=$(echo "$SECRET_JSON" | jq -r '.ollama_host // "http://localhost:11434"')
                    ollama_model_name=$(echo "$SECRET_JSON" | jq -r '.ollama_model_name // "http://'"${aws_lb.qdrant_lb.dns_name}"'"')
                    qdrant_host=$(echo "$SECRET_JSON" | jq -r '.qdrant_host // "6333"')
                    qdrant_port=$(echo "$SECRET_JSON" | jq -r '.qdrant_port // "6333"')

                    

                    echo "✅ Using ollama_host: $ollama_host"
                    echo "✅ Using QDRANT_HOST: $ollama_model_name" 
                    echo "✅ Using QDRANT_PORT: $qdrant_host"
                    echo "✅ Using QDRANT_PORT: $qdrant_port"

                    # Export environment variables
                    docker pull patelhet34/scholarsight
                    docker run -d \
                    --name scholarsight \
                    -p 5000:5000 \
                    -e  ollama_host=$ollama_host \
                    -e ollama_model_name=$ollama_model_name \
                    -e qdrant_host=$qdrant_host \
                    -e qdrant_port=$qdrant_port \
                    patelhet34/scholarsight
                  
        
                   
                    
                    qdrant_port=$(echo "$SECRET_JSON" | jq -r '.qdrant_port // "6333"')


                   
                    echo "Installing Ollama..."
                    curl -fsSL https://ollama.com/install.sh | sh

                    export HOME=/root

                    # Create systemd override for Ollama to listen on all interfaces
                    mkdir -p /etc/systemd/system/ollama.service.d
                    printf "[Service]\nEnvironment=\"OLLAMA_HOST=0.0.0.0\"\n" > /etc/systemd/system/ollama.service.d/override.conf

                    systemctl daemon-reload
                    systemctl enable ollama
                    systemctl restart ollama

                    # Wait for Ollama service to be fully started
                    echo "Waiting for Ollama service to start..."
                    sleep 30

                    # Pull the model with timeout and error handling
                    echo "Pulling mistral:7b model (this may take a while)..."
                    ollama pull mistral:7b 
                    ollama run mistral:7b


                    echo "User data script completed successfully"
                EOF

  tags = {
    Name = "scholarsight-app-model"
  }
}

resource "aws_cloudwatch_metric_alarm" "ec2_recovery" {
  alarm_name          = "scholarsight-ec2-recovery"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed_System"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_actions       = ["arn:aws:automate:${var.region}:ec2:recover"]
  dimensions = {
    InstanceId = aws_instance.app_model.id
  }
}

# IAM role for the EC2 instance
resource "aws_iam_role" "llm_instance_role" {
  name = "llm-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy to allow access to Secrets Manager
resource "aws_iam_policy" "secrets_access_policy" {
  name        = "secrets-access-policy"
  description = "Policy to allow access to specific secrets in Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        Effect   = "Allow",
        Resource = data.aws_secretsmanager_secret.scholarsight_secrets.arn
      }
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "secrets_policy_attachment" {
  role       = aws_iam_role.llm_instance_role.name
  policy_arn = aws_iam_policy.secrets_access_policy.arn
}

# Create instance profile
resource "aws_iam_instance_profile" "llm_instance_profile" {
  name = "llm-instance-profile"
  role = aws_iam_role.llm_instance_role.name
}

 




# Security Group for the Load Balancer
resource "aws_security_group" "llm_lb_security_group" {
  name        = "llm-lb-security-group"
  description = "Security group for LLM Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow HTTP traffic from anywhere
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow HTTPS traffic from anywhere
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]  # Allow all outbound traffic
  }

  tags = {
    Name = "LLM-LB-Security-Group"
  }
}

# Application Load Balancer
resource "aws_lb" "llm_lb" {
  name               = "llm-load-balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.llm_lb_security_group.id]
  subnets            = [aws_subnet.public.id, aws_subnet.public_standby.id]
  idle_timeout       = 3600  # Set idle timeout to 1 hour (3600 seconds)

  enable_deletion_protection = false

  tags = {
    Name = "LLM-Load-Balancer"
  }
}


# Target Group for LLM instances
resource "aws_lb_target_group" "llm_target_group" {
  name     = "llm-target-group"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/api/health"
    port                = "traffic-port"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Register LLM instance with the target group
resource "aws_lb_target_group_attachment" "llm_target_group_attachment" {
  target_group_arn = aws_lb_target_group.llm_target_group.arn
  target_id        = aws_instance.app_model.id
  port             = 5000
}

# SSL Certificate - Self-signed for development/testing
resource "tls_private_key" "self_signed_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "self_signed_cert" {
  private_key_pem = tls_private_key.self_signed_key.private_key_pem

  subject {
    common_name  = "querygpt.internal"
    organization = "QueryGPT Internal"
  }

  validity_period_hours = 8760  # 1 year

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

resource "aws_acm_certificate" "ssl_certificate" {
  private_key      = tls_private_key.self_signed_key.private_key_pem
  certificate_body = tls_self_signed_cert.self_signed_cert.cert_pem

  tags = {
    Name = "LLM-Self-Signed-SSL-Certificate"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Add HTTP listener for the load balancer (retained)
resource "aws_lb_listener" "llm_listener" {
  load_balancer_arn = aws_lb.llm_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.llm_target_group.arn
  }
}

# Add HTTPS listener for the load balancer
resource "aws_lb_listener" "llm_https_listener" {
  load_balancer_arn = aws_lb.llm_lb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.ssl_certificate.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.llm_target_group.arn
  }
}