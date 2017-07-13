import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { routerReducer as routing, routerMiddleware } from 'react-router-redux'

const defaultState = {
  routing: {}
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
  routing
})


const store = createStore(
  rootReducer,
  defaultState,
  applyMiddleware(...middleware)
)

export default store