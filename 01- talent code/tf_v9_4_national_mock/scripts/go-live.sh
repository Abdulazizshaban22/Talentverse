
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../infra/terraform"
terraform init
terraform validate
terraform plan -var-file=prod.tfvars -out=tfplan
terraform apply -auto-approve tfplan
echo "✅ Terraform applied. Outputs:"
terraform output
