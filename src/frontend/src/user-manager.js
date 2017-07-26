import { createUserManager } from 'redux-oidc';

const userManagerConfig = Object.assign({
  client_id: 'esar-trainingapp',
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${window.baseUrl || '/'}loggedIn`,
  response_type: 'token id_token',
  scope: 'openid profile kcsara-profile database-api introspection',
  authority: 'http://localhost:4944/auth',
  silent_redirect_uri: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${window.baseUrl || '/'}silent_renew.html`,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
}, window.siteAuth);

const userManager = createUserManager(userManagerConfig);

export default userManager;