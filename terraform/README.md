# ScholarSight Terraform Infrastructure

## Overview
This directory contains Terraform scripts to deploy the ScholarSight application on AWS Academy Learner Lab. The infrastructure includes an EC2 instance with Docker containers (Flask, Ollama, Qdrant), S3 for storage, DynamoDB for metadata, Secrets Manager for configuration, and CloudWatch for monitoring.

## Setup Instructions
1. Install Terraform: `brew install terraform` (Mac) or equivalent.
2. Configure AWS CLI: `aws configure` with credentials from .env.
3. Initialize Terraform: `terraform init`
4. Plan deployment: `terraform plan`
5. Apply deployment: `terraform apply`
6. Upload backend code to EC2: `scp -i <key.pem> -r ../backend/ ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/`

## Cleanup
Run `terraform destroy` to remove all resources after the project.

## Notes
- Ensure .env contains your AWS credentials and is not committed to GitHub.
- Adjust the backend context path in 05_ec2.tf if your codebase location differs.
