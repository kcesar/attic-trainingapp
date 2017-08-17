import * as actions from '../actions'

export default function recordsReducer(state = [], action) {
  switch (action.type) {
    case actions.REQUEST_TRAINEES:
      return {...state, loading: true }
      
    case actions.RECEIVE_TRAINEES:
      return {...state,
         loading: false,
         loaded: true,
         ...action.payload
      }

    default:
      return state;
  }  
}