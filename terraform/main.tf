terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  default     = "ap-south-1"
  description = "AWS Region for deployment"
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "EC2 Instance type"
}

# Security Group for Grubbly App Server
resource "aws_security_group" "app_sg" {
  name        = "grubbly-app-security-group"
  description = "Allow inbound HTTP, HTTPS, API, and SSH traffic"

  ingress {
    description = "HTTP Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend Express API Port"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "grubbly-sg"
    Environment = "production"
  }
}

# EC2 Instance Provisioning
resource "aws_instance" "web_server" {
  ami             = "ami-00bb6a80f01f03502" # Ubuntu Server 22.04 LTS (HVM)
  instance_type   = var.instance_type
  security_groups = [aws_security_group.app_sg.name]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io docker-compose-v2
              sudo systemctl enable docker
              sudo systemctl start docker
              EOF

  tags = {
    Name        = "Grubbly-Production-Server"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

output "instance_public_ip" {
  value       = aws_instance.web_server.public_ip
  description = "Public IP address of the newly provisioned EC2 instance"
}
