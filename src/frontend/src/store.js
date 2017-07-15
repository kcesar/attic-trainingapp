import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { routerReducer as routing, routerMiddleware } from 'react-router-redux'
import { reducer as oidc } from 'redux-oidc'


const defaultState = {
  oidc: { user: Object.keys(sessionStorage).filter(function(i) { return i.startsWith('oidc.user')}).length ? {} : null},
  routing: {},
  config: {
    localRoot: '/api',
    remoteRoot: 'http://localhost:4944/api2'
  }
}

export const history = createBrowserHistory()

const middleware = [
  routerMiddleware(history),
  thunkMiddleware
]

if(process.env.NODE_ENV === 'development' || (localStorage && localStorage.showLogging)) {
	const loggerMiddleware = createLogger();
	middleware.push(loggerMiddleware);
}

const rootReducer = combineReducers({
  routing,
  oidc,
  config: function tasksReducer(state = [], action) { return state }
})


const store = createStore(
  rootReducer,
  defaultState,
  applyMiddleware(...middleware)
)

export default store