import { reducer as oidc } from 'redux-oidc'
import * as actions from '../actions'

export default function oidcReducer(state = {}, action) {
  const newState = oidc(state, action)

  switch (action.type) {
    case actions.SIGNING_OUT:
      return { signingOut: true }

    case actions.RECEIVE_ROLES:
      return { ...state, roles: action.payload.roles }

    case 'redux-oidc/USER_FOUND':
      return { ...newState, expired: false, signedIn: true }

    case 'redux-oidc/USER_EXPIRED':
      return { ...newState, expired: true, signedIn: false }

    default:
      return newState
  }
}