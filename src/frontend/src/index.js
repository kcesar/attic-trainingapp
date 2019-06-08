import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { loadUser } from 'redux-oidc'
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import './App.css'

import store from './store'
import userManager from './user-manager'
import * as serviceWorker from './serviceWorker'

// Where should this go?
axios.interceptors.request.use(config => {
  const user = store.getState().oidc.user
  if (user && user.access_token) {
    config.headers['Authorization'] = 'Bearer ' + user.access_token
  }
  return config
}, error => Promise.reject(error))

loadUser(store, userManager)


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
