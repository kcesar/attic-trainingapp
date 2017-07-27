import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { routerReducer as routing, routerMiddleware } from 'react-router-redux'
import { reducer as oidc } from 'redux-oidc'

import progress from './reducers/progress-reducer'
import records from './reducers/records-reducer'
import schedule from './reducers/schedule-reducer'

const defaultState = {
  oidc: { user: Object.keys(sessionStorage).filter(function(i) { return i.startsWith('oidc.user')}).length ? {} : null},
  routing: {},
  tasks: [
      { 'title': 'Contact Information', summary: 'Address, Email, Phone Number', category: 'personal' },
      { 'title': 'Emergency Contacts', summary: 'Who to call in an emergency', category: 'personal' },
      { 'title': 'ICS-100', summary: 'FEMA required online course', category: 'online', details: 'ICS 100, Introduction to the Incident Command System, introduces the Incident Command System (ICS) and provides the foundation for higher level ICS training. This course describes the history, features and principles, and organizational structure of the Incident Command System. It also explains the relationship between ICS and the National Incident Management System (NIMS).\n\nhttps://training.fema.gov/is/courseoverview.aspx?code=IS-100.b' },
      { 'title': 'ICS-700', summary: 'FEMA required online course', category: 'online' },
      { 'title': 'Course A', summary: 'Evening orientation', category: 'session', details: 'This is an in-town weeknight informational meeting used to present ESAR objectives, organization and procedures.\n\nDiscussions center on basic training course content, requirements for team member field qualification, and personal equipment needs.', hours: 2},
      { 'title': 'Course B - Map + Compass', summary: 'Indoor navigation course', category: 'session', prereqs: ['Course A'], hours: 9 },
      { 'title': 'Course B - First Aid', summary: "First aid and CPR training", category: 'session', prereqs: ['Course A'], hours: 9 },
      { 'title': 'Background Check', summary: "Sheriff's Office application", category: 'paperwork' },
      { 'title': 'LFL Registration', summary: "For youth members", category: 'paperwork' },
      { 'title': 'Submit Photo', summary: "Submit portrait for ID card", category: 'paperwork' },
      { 'title': 'Course C', summary: "Outdoor weekend - Intro to SAR", category: 'session', hours: 32.5, prereqs: ['Course B - Map + Compass', 'Course B - First Aid', 'Background Check', 'LFL Registration'] },
      { 'title': 'Course I', summary: "Outdoor weekend - Navigation", category: 'session', prereqs: ['Course C'], hours: 31 },
      { 'title': 'Course II', summary: "Outdoor weekend - Evaluation", category: 'session', prereqs: ['Course I'], hours: 31 },
      { 'title': 'Searcher First Aid', summary: "SAR specific first aid", category: 'session', prereqs: ['Course II'], hours: 9 },
      { 'title': 'Course III', summary: "Outdoor weekend - mock mission", category: 'session', prereqs: ['Searcher First Aid'], hours: 31 },
    ],
  records: { loaded: false, loading: false},
  progress: {},
  config: {
    localRoot: '',
    remoteRoot: 'http://localhost:4944/api2',
    authRoot: 'http://localhost:4944/auth'
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
  tasks: function tasksReducer(state = [], action) { return state },
  config: function tasksReducer(state = [], action) { return state },
  records,
  progress,
  schedule
})


const store = createStore(
  rootReducer,
  defaultState,
  applyMiddleware(...middleware)
)

export default store