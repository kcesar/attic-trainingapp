import 'babel-polyfill/dist/polyfill.js'
import React from 'react'
import ReactDOM from 'react-dom'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import { loadUser, OidcProvider } from 'redux-oidc'
import { GatewayProvider, GatewayDest } from 'react-gateway'

import moment from 'moment'
import momentLocalizer from 'react-widgets/lib/localizers/moment'
import axios from 'axios'

import 'react-widgets/dist/css/react-widgets.css'
import './assets/bootstrap.min.css'
import './index.css'

import App from './App'
import registerServiceWorker from './registerServiceWorker'
import store, { history } from './store'
import userManager from './user-manager'

import HomePage from './pages/home'
import TraineesPage from './pages/trainees'
import TraineePage from './pages/trainee'
import AdminHomePage from './pages/admin-home'
import CoursesPage from './pages/course-list'
import CourseRoster from './pages/course-roster'
import LoggedInPage from './pages/logged-in'
import SignupPage from './pages/signup'

import * as actions from './actions'

const baseUrl = window.baseUrl || '/'

momentLocalizer(moment)

const watchMemberId = props => {
  console.log('watchMemberId')
  const { member, oidc } = store.getState()
  const memberId = ((props.match || {}).params || {}).memberId || (((oidc||{}).user||{}).profile||{}).memberId
  if (memberId !== (member||{}).id) {
    store.dispatch({type: actions.SET_MEMBER, payload: { id: memberId } })
  }
  return null
}
store.subscribe(() => {
  watchMemberId({match: { params: { memberId: store.getState().member.id }}})
})

const router = (
  <ConnectedRouter history={history} basename={baseUrl}>
    <GatewayProvider>
      <div>
        <Route path={baseUrl} component={App} />
        <Route exact path={baseUrl + "loggedIn"} component={LoggedInPage} />
        <Route exact path={baseUrl} component={HomePage} />
        <Route path={baseUrl + 'me'} render={watchMemberId} />
        <Route exact path={baseUrl + "me"} component={TraineePage} />
        <Route exact path={baseUrl + "admin"} component={AdminHomePage} />
        <Route path={baseUrl + "admin/trainees/:memberId"} render={watchMemberId} />
        <Route exact path={baseUrl + 'admin/trainees'} component={TraineesPage} />
        <Route exact path={baseUrl + 'admin/trainees/:memberId'} component={TraineePage} />
        <Route exact path={baseUrl + 'courses'} component={CoursesPage} />
        <Route exact path={baseUrl + 'admin/courses'} component={CoursesPage} />
        <Route exact path={baseUrl + 'admin/courses/:courseId(\\d+)'} component={CourseRoster} />
        <Route exact path={baseUrl + "signup"} component={SignupPage} />
        <div className='container py-4'>
          <div className='row justify-content-center'>
            <div style={{ margin: '0 auto', textAlign: 'center', padding: '5px', fontSize: '90%' }}>© 2017 - This project is open source. View it on <a href="https://github.com/kcesar/esar-training">GitHub</a></div>
          </div>
        </div>
        <GatewayDest name="root" />
      </div>
    </GatewayProvider>
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
  <Provider store={store}>
    <OidcProvider store={store} userManager={userManager}>
      {router}
    </OidcProvider>
  </Provider>
  , document.getElementById('root'));
//registerServiceWorker();

