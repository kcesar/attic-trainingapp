import axios from 'axios'
import userManager from '../user-manager'
import { isInRole } from '../utils'

export const REQUEST_RECORDS = 'REQUEST_RECORDS'
export const RECEIVE_RECORDS = 'RECEIVE_RECORDS'
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS'
export const REQUEST_SESSIONS = 'REQUEST_SESSIONS'
export const RECEIVE_SESSIONS = 'RECEIVE_SESSIONS'
export const SET_MEMBER = 'SET_MEMBER'
export const SIGNING_OUT = 'SIGNING_OUT'

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

export function getSchedule() {
  return (dispatch, getState) => {
    var state = getState()

    dispatch({ type: REQUEST_SESSIONS })
    return axios.get(`${state.config.localRoot}/api/schedule`)
    .then((msg) => dispatch({type: RECEIVE_SESSIONS, payload: { data: msg.data.items }}))
    .then(() => dispatch({type: UPDATE_PROGRESS, payload: getState() }))
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