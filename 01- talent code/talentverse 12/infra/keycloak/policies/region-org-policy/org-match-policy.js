
// Grant if user's organization attribute equals resource's organization attribute
var userOrg = (identity && identity.getAttributes()) ? identity.getAttributes().getFirst('organization') : null;
var resOrg = (resource && resource.getAttributes()) ? resource.getAttributes().getFirst('organization') : null;
if (userOrg && resOrg && userOrg.toLowerCase() === resOrg.toLowerCase()) {
  $evaluation.grant();
}
