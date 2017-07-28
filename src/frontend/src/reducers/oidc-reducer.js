import { reducer as oidc } from 'redux-oidc'
import * as actions from '../actions'

export default function oidcReducer(state = {}, action) {
  switch (action.type) {
    case actions.SIGNING_OUT:
      return { signingOut: true }
    default:
    console.log('oidc', action, state)
    const newState = oidc(state, action)
    console.log(newState)
      return newState
  }
}