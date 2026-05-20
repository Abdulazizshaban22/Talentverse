
# Protocol Mappers (Attributes → Claims)
Map user attributes `region` and `organization` (and group attributes if needed) into access tokens.

Example (Terraform):
```
resource "keycloak_openid_user_attribute_protocol_mapper" "region" {
  realm_id        = var.realm_id
  client_id       = keycloak_openid_client.api_gateway.id
  name            = "region"
  user_attribute  = "region"
  claim_name      = "region"
  claim_value_type = "String"
  add_to_access_token = true
}
```
