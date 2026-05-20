# مورد الاستيراد — أكمل قيمه بعد import
provider "aws" { alias = "us_east_1" region = "us-east-1" }
resource "aws_cloudfront_vpc_origin" "private_app" { provider = aws.us_east_1 }
# web_acl_id = aws_wafv2_web_acl.cf_acl.arn  ← اربطه في توزيع CloudFront
