resource "aws_cloudfront_public_key" "this" {
  name        = "${var.name}-pubkey"
  encoded_key = file("${path.module}/keys/public_key.pem")
  comment     = "Public key for signed URLs/cookies"
}
resource "aws_cloudfront_key_group" "this" { name  = "${var.name}-keygroup"; items = [aws_cloudfront_public_key.this.id] }
