import * as actions from '../actions'
import moment from 'moment'

export default function memberReducer(state = [], action) {
  switch (action.type) {
    // case actions.RECEIVE_MEMBER:
    //   return action.payload.tasks.reduce((prev, cur) => { prev[cur.title] = getProgress(cur, prev, action.payload); return prev }, {})
    default:
      return state
  }
}
