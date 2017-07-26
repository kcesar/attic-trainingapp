import * as actions from '../actions'

export default function scheduleReducer(state = [], action) {
  switch (action.type) {
    case actions.RECEIVE_SESSIONS:
      return action.payload.data
    default:
      return state
  }
}
