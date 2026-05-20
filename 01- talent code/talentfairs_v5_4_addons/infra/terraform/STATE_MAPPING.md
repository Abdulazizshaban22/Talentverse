# CloudFront VPC Origin → Terraform state mapping

- Import the **distribution** into `aws_cloudfront_distribution.edge` with:  
  `terraform import aws_cloudfront_distribution.edge <DIST_ID>`

- Import the **VPC origin** into `aws_cloudfront_vpc_origin.private_app` with:  
  `terraform import aws_cloudfront_vpc_origin.private_app <VPC_ORIGIN_ARN>`

- After import, run `terraform state show` for both resources and copy the arguments
  you intend to manage into HCL. Use `lifecycle { ignore_changes = [...] }` to avoid
  churn on fields updated by console or APIs.

**Provider requirement:** `hashicorp/aws >= 5.82.0` for `aws_cloudfront_vpc_origin`.Consult the registry for exact arguments and import identifiers.
