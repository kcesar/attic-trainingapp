import * as actions from '../actions'

export default function memberReducer(state = {}, action) {
  switch (action.type) {
    case actions.SET_MEMBER:
      return action.payload

    default:
      return state
  }
}
