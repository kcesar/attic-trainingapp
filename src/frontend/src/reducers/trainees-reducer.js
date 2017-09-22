import * as actions from '../actions'

function reduceTraineeDetail(state, payload) {
  let found = false
  const details = Object.assign({}, payload.member, { contacts: payload.contacts })

  const newState = {...state,
      items: (state.items||[]).map(
        t => t.id === payload.member.id
                ? Object.assign({}, t, details) 
                : t
      )
    }
  if (!found) {
    newState.items.push(details)
  }
  return newState
}

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

    case actions.RECEIVE_TRAINEE:
      return reduceTraineeDetail(state, action.payload)  

    default:
      return state;
  }  
}