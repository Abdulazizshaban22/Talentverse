#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 2 ]; then echo "Usage: $0 <DISTRIBUTION_ID> <VPC_ORIGIN_ARN>"; exit 1; fi
DIST="$1"; ORN="$2"
( cd infra/terraform && terraform import aws_cloudfront_distribution.edge "$DIST" || true )
( cd infra/terraform && terraform import aws_cloudfront_vpc_origin.private_app "$ORN" || true )
echo "✅ Imported. Show state: (cd infra/terraform && terraform state show aws_cloudfront_vpc_origin.private_app)"
