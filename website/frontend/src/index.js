import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { loadUser, OidcProvider } from 'redux-oidc';
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css'
import App from './App'

import store from './store'
import userManager from './user-manager'
import * as serviceWorker from './serviceWorker'
import { ActionsFactory as oidcActionsFactory } from './redux/oidc';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');

// Where should this go?
axios.interceptors.request.use(config => {
  const user = store.getState().oidc.user
  if (user && user.access_token) {
    config.headers['Authorization'] = 'Bearer ' + user.access_token
  }
  return config
}, error => Promise.reject(error))

const authActions = oidcActionsFactory(userManager);

function silentSignin() {
  store.dispatch({type: 'redux-oidc/LOADING_USER'});
  userManager.signinSilent().then(user => {
    // Nothing to do, handled by oidc-client-js internally
    }, err => {
        userManager.events._raiseSilentRenewError(err);
  });
}

userManager.events.addUserLoaded(() => {
  store.dispatch(authActions.loadGroups())
})

loadUser(store, userManager)
.then(user => {
  if (user) {
    store.dispatch(authActions.loadGroups())
  } else {
    silentSignin();
    if (window.reactConfig.oidc) {
      store.dispatch(authActions.preloadUser(window.reactConfig.oidc));
    }
  }
}).catch((err) => {
  console.log('loaduser catch', err)
  silentSignin();
})

ReactDOM.render(
  <Provider store={store}>
    <i style={{display:'none'}} className='fas fa-spinner' />{/*load the icon font as soon as possible */}
    <OidcProvider store={store} userManager={userManager}>
      <BrowserRouter basename={baseUrl}>
        <App />
      </BrowserRouter>
    </OidcProvider>
  </Provider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
