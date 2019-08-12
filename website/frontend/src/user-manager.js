import { createUserManager } from 'redux-oidc';

const userManagerConfig = Object.assign({
  authority: 'http://localhost:5100',
  client_id: 'esar-trainingapp',
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : "" }/loggedIn`,
  post_logout_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}/`,
  end_session_endpoint: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : "" }/connect/endsession`,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}/silent-renew.html`,
  filterProtocolClaims: true,
  loadUserInfo: true,
  scope: "openid profile database-api auth-api",
  response_type: "token id_token",
}, (window.reactConfig||{}).auth);

const userManager = createUserManager(userManagerConfig);

export default userManager;