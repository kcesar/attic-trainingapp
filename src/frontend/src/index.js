import 'babel-polyfill/dist/polyfill.js'
import React from 'react'
import ReactDOM from 'react-dom'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { loadUser, OidcProvider } from 'redux-oidc'

import axios from 'axios'

import './assets/bootstrap.min.css'
import './index.css'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import store, { history } from './store'
import userManager from './user-manager'

import HomePage from './pages/home'
import TraineePage from './pages/trainee'
import LoggedInPage from './pages/logged-in'
import SignupPage from './pages/signup'

injectTapEventPlugin()

const baseUrl = window.baseUrl || '/'

const router = (
  <ConnectedRouter history={history} basename={baseUrl}>
    <div>
      <Route path={baseUrl} component={App} />
      <div className='container'>
        <Route exact path={baseUrl + "loggedIn"} component={LoggedInPage} />
        <Route exact path={baseUrl} component={HomePage}/>
        <Route exact path={baseUrl + "me"} component={TraineePage} />
        <Route exact path={baseUrl + "signup"} component={SignupPage} />
        <div className='row justify-content-center'>
          <div style={{margin:'0 auto', textAlign:'center', padding: '5px', fontSize: '90%'}}>© 2017 - This project is open source. View it on <a href="https://github.com/kcesar/esar-training">GitHub</a></div>
        </div>
      </div>
    </div>
  </ConnectedRouter>
)

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
  <MuiThemeProvider>
    <Provider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        {router}
      </OidcProvider>
    </Provider>
  </MuiThemeProvider>
 , document.getElementById('root'));
registerServiceWorker();

