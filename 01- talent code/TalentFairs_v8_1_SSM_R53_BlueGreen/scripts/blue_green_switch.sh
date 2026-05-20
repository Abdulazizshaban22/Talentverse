
#!/usr/bin/env bash
set -euo pipefail
# Usage: blue_green_switch.sh <web_green_weight> <api_green_weight>
: "${1:?web_green_weight required (0..100)}"
: "${2:?api_green_weight required (0..100)}"
WEBG="$1"; APIG="$2"
cd "$(dirname "$0")/../infra/terraform/app"
TFVARS_TMP=".tfvars.autogen"
cat > "$TFVARS_TMP" <<EOF
web_blue_weight  = $((100 - WEBG))
web_green_weight = $WEBG
api_blue_weight  = $((100 - APIG))
api_green_weight = $APIG
EOF
terraform apply -auto-approve -var-file="$TFVARS_TMP"
rm -f "$TFVARS_TMP"
