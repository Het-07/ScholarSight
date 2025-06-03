resource "aws_amplify_app" "frontend" {
  name         = "scholar"
  repository   = "git@github.com:Het-07/ScholarSight.git"
  access_token = var.github_access_token

  # Build settings
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend && npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  # Enable automatic branch deployments
  enable_auto_branch_creation = true
  enable_branch_auto_build   = true
  enable_branch_auto_deletion = true


  # Environment variables
  environment_variables = {
    ENV = "production"
    VITE_SERVER_URL = "https://${aws_lb.llm_lb.dns_name}"
  }
}

# Branch configuration
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"

  framework = "React"
  stage     = "PRODUCTION"

  enable_auto_build = true
}

# Define variables
variable "github_access_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
}

# Output the Amplify app URL
output "Application_URL" {
  value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}