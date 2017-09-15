import * as actions from '../actions'

export default function scheduleReducer(state = { loaded: false, loading: false, courses: {}}, action) {
  switch (action.type) {
    case actions.REQUEST_SESSIONS:
      return { ...state, loading: true }
    case actions.RECEIVE_SESSIONS:
      return { loading: false, loaded: true, courses: action.payload.data }
    default:
      return state
  }
}
