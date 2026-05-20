#!/usr/bin/env bash
set -euo pipefail

# Usage:
#  ./import.sh <CLOUDFRONT_DISTRIBUTION_ID> <VPC_ORIGIN_ARN>
#
# Example:
#  ./import.sh E123ABC456XYZ arn:aws:cloudfront::123456789012:vpc-origin/vo-0abc123def4567890
#
# Requirements: awscli v2, terraform >= 1.6, AWS creds with CFN permissions.

if [ $# -lt 2 ]; then
  echo "Usage: $0 <DISTRIBUTION_ID> <VPC_ORIGIN_ARN>" >&2
  exit 1
fi

DIST_ID="$1"
VPC_ORIGIN_ARN="$2"

# 1) Sanity: read current distribution config
aws cloudfront get-distribution-config --id "$DIST_ID" > dist-${DIST_ID}.json
echo "Downloaded distribution config → dist-${DIST_ID}.json"

# 2) Import the distribution into state (if not already managed)
#    Resource name below must match your HCL (e.g., aws_cloudfront_distribution.edge)
set +e
terraform state show aws_cloudfront_distribution.edge >/dev/null 2>&1
HAS_DIST=$?
set -e
if [ $HAS_DIST -ne 0 ]; then
  echo "Importing distribution aws_cloudfront_distribution.edge ..."
  terraform import aws_cloudfront_distribution.edge "$DIST_ID"
else
  echo "aws_cloudfront_distribution.edge already in state"
fi

# 3) Import the VPC origin as a standalone resource (requires aws provider >= 5.82)
set +e
terraform state show aws_cloudfront_vpc_origin.private_app >/dev/null 2>&1
HAS_VO=$?
set -e
if [ $HAS_VO -ne 0 ]; then
  echo "Importing VPC origin aws_cloudfront_vpc_origin.private_app ..."
  terraform import aws_cloudfront_vpc_origin.private_app "$VPC_ORIGIN_ARN"
else
  echo "aws_cloudfront_vpc_origin.private_app already in state"
fi

echo "✅ Import complete. Next:"
echo "  - Run: terraform state show aws_cloudfront_vpc_origin.private_app"
echo "  - Copy relevant attributes into infra/terraform/cloudfront_vpc_origin.tf (or ignore_changes)"
echo "  - Ensure your aws_cloudfront_distribution 'origin { vpc_origin_config { ... } }' references the imported origin."
