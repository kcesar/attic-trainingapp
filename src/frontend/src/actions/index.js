import axios from 'axios'
import userManager from '../user-manager'

export const REQUEST_RECORDS = 'REQUEST_RECORDS'
export const RECEIVE_RECORDS = 'RECEIVE_RECORDS'
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS'
export const REQUEST_SESSIONS = 'REQUEST_SESSIONS'
export const RECEIVE_SESSIONS = 'RECEIVE_SESSIONS'
export const SET_MEMBER = 'SET_MEMBER'
export const SIGNING_OUT = 'SIGNING_OUT'
export const RECEIVE_ROLES = 'RECEIVE_ROLES'
export const REQUEST_TRAINEES = 'REQUEST_TRAINEES'
export const RECEIVE_TRAINEES = 'RECEIVE_TRAINEES'
export const REQUEST_TRAINEE = 'REQUEST_TRAINEE'
export const RECEIVE_TRAINEE = 'RECEIVE_TRAINEE'
export const REQUEST_ROSTER = 'REQUEST_ROSTER'
export const RECEIVE_ROSTER = 'RECEIVE_ROSTER'

export const UPLOAD_TRAINING_DOCUMENT = 'ADD_TRAINING_DOCUMENT'

export const LEAVING_SESSION = 'LEAVING_SESSION'
export const JOINING_SESSION = 'JOINING_SESSION'

export function getUserData() {
  return (dispatch, getState) => {
    var state = getState();

    dispatch({type: REQUEST_RECORDS})
    return axios.get(`${state.config.remoteRoot}/members/${state.member.id || state.oidc.user.profile.memberId}`)
    .then((msg) => {
      dispatch({type: SET_MEMBER, payload: msg.data})
      return axios.get(`${state.config.remoteRoot}/members/${state.member.id || state.oidc.user.profile.memberId}/trainingrecords`)
    })
    .then((msg) =>
      dispatch({type: RECEIVE_RECORDS, payload: {data: msg.data.items, filterNames: state.tasks.map(t => t.title)}}))
    .then(() =>
      dispatch({type: UPDATE_PROGRESS, payload: getState() }))
  }
}

export function getTrainee(memberId) {
  return (dispatch, getState) => {
    var state = getState();
    let member = null

    if ((state.trainees.items||[]).find(t => t.id.toLowerCase() === memberId.toLowerCase())) return Promise.resolve()

    dispatch({type: REQUEST_TRAINEE, payload: { id: memberId }})
    return axios.get(`${state.config.remoteRoot}/members/${memberId}`)
    .then((msg) => {
      member = msg.data
      return axios.get(`${state.config.remoteRoot}/members/${memberId}/contacts`)
      .then((msg) => {
        dispatch({type: RECEIVE_TRAINEE, payload: { member, contacts: msg.data }})
      })
    })
  }
}

export function getSchedule(forMember) {
  return (dispatch, getState) => {
    var state = getState()
    const memberId = forMember ? state.member.id : null
    dispatch({ type: REQUEST_SESSIONS, payload: { memberId } })
    return axios.get(`${state.config.localRoot}/api/schedule` + (forMember ? `/${state.member.id || state.oidc.user.profile.memberId}` : ''))
    .then((msg) => dispatch({type: RECEIVE_SESSIONS, payload: { data: msg.data.items, memberId }}))
    .then(() => dispatch({type: UPDATE_PROGRESS, payload: getState() }))
  }
}

export function getRoster(courseName, session) {
  return (dispatch, getState) => {
    var state = getState()
    dispatch({type: REQUEST_ROSTER, payload: { courseName, session }})
    return axios.get(`${state.config.localRoot}/api/sessions/${session.id}/roster`)
    .then((msg) => {
      dispatch({type: RECEIVE_ROSTER, payload: { data: msg.data, courseName, session }})
      var requests = msg.data.map(r => getTrainee(r.memberId)(dispatch, getState))
      return Promise.all(requests)
    })
  }
}

export function doSignin(targetUrl) {
  return (dispatch, getState) => {
    var state = getState();
    if (!state.oidc.user || !state.oidc.user.token_type) {
      const origin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
      sessionStorage.setItem('redirect', window.location.href.substring(origin.length))
      return userManager.signinRedirect();
    }
    return Promise.resolve()
  }
}

export function getRoles(userId) {
  return (dispatch, getState) => {
    var state = getState()
    return axios.get(`${state.config.authRoot}/Account/${userId}/Groups`)
    .then((msg) => {
      dispatch({type: RECEIVE_ROLES, payload: { roles: msg.data.data, userId }})
    //  var requests = msg.data.map(r => getTrainee(r.memberId)(dispatch, getState))
    //  return Promise.all(requests)
    })
  }
}

export function doSignout() {
  return (dispatch, getState) => {
    var state = getState();
    if (state.oidc.user && state.oidc.user.token_type) {
      dispatch({type: SIGNING_OUT})
      sessionStorage.setItem('redirect', window.baseUrl || '/')
      return userManager.signoutRedirect();
    }
    return Promise.resolve()
  }
}

export function getTraineesData() {
  return (dispatch, getState) => {
    var state = getState();

    dispatch({type: REQUEST_TRAINEES})
    return axios.get(`${state.config.remoteRoot}/units/${state.config.unitId}/memberships/bystatus/trainee`)
    .then((msg) => {
      dispatch({type: RECEIVE_TRAINEES, payload: msg.data})
    })
  }
}

export function doLeaveSession(sessionId) {
  return (dispatch, getState) => {
    var state = getState();

    dispatch({type: LEAVING_SESSION, payload: { id: sessionId }})
    return axios.delete(`${state.config.localRoot}/api/schedule/${state.member.id}/session/${sessionId}`)
    .then((msg) => {
      dispatch({type: RECEIVE_SESSIONS, payload: { data: msg.data.result.items }})
      return msg.data
    })
  }
}

export function doJoinSession(sessionId) {
  return (dispatch, getState) => {
    var state = getState();

    dispatch({type: JOINING_SESSION, payload: { id: sessionId }})
    return axios.post(`${state.config.localRoot}/api/schedule/${state.member.id}/session/${sessionId}`)
    .then((msg) => {
      dispatch({type: RECEIVE_SESSIONS, payload: { data: msg.data.result.items }})
      return msg.data
    })
  }
}