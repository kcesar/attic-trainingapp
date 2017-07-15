import axios from 'axios'

export const REQUEST_RECORDS = 'REQUEST_RECORDS'
export const RECEIVE_RECORDS = 'RECEIVE_RECORDS'
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS'

export function getUserData() {
  return (dispatch, getState) => {
    var state = getState();
    
    dispatch({type: REQUEST_RECORDS})
    return axios.get(`${state.config.remoteRoot}/members/${state.oidc.user.profile.memberId}/trainingrecords`)
      .then((msg) => dispatch({type: RECEIVE_RECORDS, payload: {data: msg.data.items, filterNames: state.tasks.map(t => t.title)}}))
      .then(() => dispatch({type: UPDATE_PROGRESS, payload: getState() }))
  }
}