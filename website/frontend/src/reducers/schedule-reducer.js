import * as actions from '../actions'

export default function scheduleReducer(state = { loaded: false, loading: false, courses: {}}, action) {
  switch (action.type) {
    case actions.REQUEST_SESSIONS:
      return { ...state, loading: true, memberId: action.payload.memberId }
    case actions.RECEIVE_SESSIONS:
      return { loading: false, loaded: true, memberId: action.payload.data, courses: action.payload.data }
    default:
      return state
  }
}
