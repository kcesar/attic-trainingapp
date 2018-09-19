import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'
import { routerReducer as routing, routerMiddleware } from 'react-router-redux'

import progress from './reducers/progress-reducer'
import records from './reducers/records-reducer'
import trainees from './reducers/trainees-reducer'
import schedule from './reducers/schedule-reducer'
import member from './reducers/member-reducer'
import roster from './reducers/roster-reducer'
import oidc from './reducers/oidc-reducer'

const defaultState = {
  oidc: { user: Object.keys(sessionStorage).filter(function(i) { return i.startsWith('oidc.user')}).length ? {} : null},
  routing: {},
  tasks: [
      { 'title': 'Contact Information', summary: 'Address, Email, Phone Number', category: 'personal' },
      { 'title': 'Emergency Contacts', summary: 'Who to call in an emergency', category: 'personal' },
      { 'title': 'ICS-100', summary: 'FEMA required online course', category: 'online', details: 'ICS 100, Introduction to the Incident Command System, introduces the Incident Command System (ICS) and provides the foundation for higher level ICS training. This course describes the history, features and principles, and organizational structure of the Incident Command System. It also explains the relationship between ICS and the National Incident Management System (NIMS).\n\nhttps://training.fema.gov/is/courseoverview.aspx?code=IS-100.b' },
      { 'title': 'ICS-700', summary: 'FEMA required online course', category: 'online', details: 'This course introduces and overviews the National Incident Management System (NIMS). NIMS provides a consistent nationwide template to enable all government, private-sector, and nongovernmental organizations to work together during domestic incidents.\n\nhttps://training.fema.gov/is/courseoverview.aspx?code=IS-700.a', },
      { 'title': 'Course A', summary: 'Evening orientation', category: 'session', details: 'This is an in-town weeknight informational meeting used to present ESAR objectives, organization and procedures.\n\nDiscussions center on basic training course content, requirements for team member field qualification, and personal equipment needs.', hours: 2},
      { 'title': 'Course B - Map + Compass', summary: 'Indoor navigation course', category: 'session', prereqs: ['Course A'], hours: 9 },
      { 'title': 'First Aid', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent First Aid card', category: 'paperwork', details: 'Submit a scan or picture of a current first aid card to training.admin@kcesar.org' },
      { 'title': 'CPR', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent CPR card', category: 'paperwork', details: 'Submit a scan or picture of a current CPR card to training.admin@kcesar.org' },
      { 'title': 'ESAR F/A - Basic', summary: '', category: 'session', hours: 3, prereqs: ['Course A', 'First Aid', 'CPR']},
      { 'title': 'ESAR F/A - Intermediate', summary: '', category: 'session', hours: 3, prereqs: ['Course B - Map + Compass', 'ESAR F/A - Basic']},
      { 'title': 'Background Check', summary: "Sheriff's Office application", category: 'paperwork', details: 'All potential KCESAR members submit an application to the King County Sheriff\'s office, who will conduct a criminal background check on the applicant.\n\nThis status will be updated when we are informed that you have passed this check. KCESAR does not receive the result of the background check except a pass/fail from the sheriff\'s office.' },
      { 'title': 'LFL Registration', summary: "For youth members", category: 'paperwork' },
//      { 'title': 'Submit Photo', summary: "Submit portrait for ID card", category: 'paperwork' },
      { 'title': 'Course C', summary: "Outdoor weekend - Intro to SAR", category: 'session', hours: 32.5, prereqs: ['Course B - Map + Compass', 'ESAR F/A - Basic' /*, 'Background Check', 'LFL Registration'*/] },
      { 'title': 'Course I', summary: "Outdoor weekend - Navigation", category: 'session', prereqs: ['Course C'], hours: 31 },
      { 'title': 'Course II', summary: "Outdoor weekend - Evaluation", category: 'session', prereqs: ['Course I'], hours: 31 },
      { 'title': 'ESAR F/A - Advanced', summary: "SAR specific first aid", category: 'session', prereqs: ['Course II', 'ESAR F/A - Intermediate'], hours: 3 },
      { 'title': 'Course III', summary: "Outdoor weekend - mock mission", category: 'session', prereqs: ['ESAR F/A - Advanced', 'ICS-100', 'ICS-700'], hours: 31 },
    ],
  trainees: [],
  records: { loaded: false, loading: false},
  progress: {},
  config: Object.assign({
    localRoot: '',
    remoteRoot: 'https://database.kcsara.org/api2',
    authRoot: 'https://database.kcsara.org/auth',
    unitId: 'C2F99BB4-3056-4097-9345-4B8797F40E10'
  }, window.siteConfig)
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
  trainees,
  progress,
  schedule,
  roster,
  member
})


const store = createStore(
  rootReducer,
  defaultState,
  applyMiddleware(...middleware)
)

export default store