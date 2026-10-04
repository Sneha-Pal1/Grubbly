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

# AWS S3 Bucket for Food Media Storage
resource "aws_s3_bucket" "media_bucket" {
  bucket        = "grubbly-media-storage-bucket"
  force_destroy = true

  tags = {
    Name        = "Grubbly-Media-Bucket"
    Environment = "production"
  }
}

# S3 Public Access Block Configuration
resource "aws_s3_bucket_public_access_block" "media_bucket_access" {
  bucket = aws_s3_bucket.media_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# AWS CloudFront CDN Distribution for High-Speed Image Delivery
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.media_bucket.bucket_regional_domain_name
    origin_id   = "S3-Grubbly-Media"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Grubbly-Media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "Grubbly-CloudFront-CDN"
    Environment = "production"
  }
}

output "instance_public_ip" {
  value       = aws_instance.web_server.public_ip
  description = "Public IP address of the newly provisioned EC2 instance"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.cdn.domain_name
  description = "CloudFront CDN domain URL for media distribution"
}
