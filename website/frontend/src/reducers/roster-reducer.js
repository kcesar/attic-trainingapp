import * as actions from '../actions'

export default function rosterReducer(state = { loaded: false, loading: false, items: []}, action) {
  switch (action.type) {
    case actions.REQUEST_ROSTER:
      return { ...state, loading: true, session: action.payload.session, courseName: action.payload.courseName }
    case actions.RECEIVE_ROSTER:
      return Object.assign({}, state, {
        loading: false,
        loaded: true,
        items: action.payload.data
      })
    default:
      return state
  }
}
