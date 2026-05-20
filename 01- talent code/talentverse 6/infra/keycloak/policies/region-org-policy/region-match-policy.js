
// Grant if user's region attribute equals resource's region attribute
// context, resource, identity, permission per Keycloak Evaluation API
var userRegion = (identity && identity.getAttributes()) ? identity.getAttributes().getFirst('region') : null;
var resRegion = (resource && resource.getAttributes()) ? resource.getAttributes().getFirst('region') : null;
if (userRegion && resRegion && userRegion.toLowerCase() === resRegion.toLowerCase()) {
  $evaluation.grant();
}
