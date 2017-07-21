import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  client_id: 'esar-trainingapp',
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/loggedIn`,
  response_type: 'token id_token',
  scope: 'openid profile kcsara-profile database-api',
  authority: 'http://localhost:4944/auth',
  silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/silent_renew.html`,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;