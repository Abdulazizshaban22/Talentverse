###############################################################################
# CloudFront VPC Origins + Distribution wiring (Terraform AWS Provider >= 5.82)
# NOTE: Keep your CloudFront distribution defined separately (edge.tf). This
# file adds a standalone VPC origin resource and shows how to reference it.
###############################################################################

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.82.0"
    }
  }
}

# us-east-1 is required for CloudFront control-plane
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Example: import this with the ARN printed by the console/API
resource "aws_cloudfront_vpc_origin" "private_app" {
  provider = aws.us_east_1

  # After import, Terraform state will contain full attributes. Keep only
  # arguments you want to manage declaratively, and prefer 'lifecycle { ignore_changes = [...] }'
  # for fields that are controlled elsewhere.
  # The minimal HCL will be auto-hydrated by `terraform import` + `terraform state show`.
}

# Example association in your distribution (snippet).
# You can point an origin to the VPC origin by using `origin {
#   vpc_origin_config { vpc_origin_id = aws_cloudfront_vpc_origin.private_app.id }
# }` on the aws_cloudfront_distribution resource.
#
# Refer to registry docs for VPC origin arguments and to the API reference for 'VpcOriginConfig'.
