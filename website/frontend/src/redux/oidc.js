import { reducer as oidc } from 'redux-oidc';
import axios from 'axios';

export const PRELOAD = 'oidc/PRELOAD';
export const SIGNING_OUT = 'oidc/SIGNING_OUT';
export const LOADING_GROUPS = 'oidc/LOADING_GROUPS';
export const LOADED_GROUPS = 'oidc/LOADED_GROUPS';

export const ActionsFactory = (userManager) => ({
  doSignout: () => (dispatch) => {
    dispatch({type: SIGNING_OUT })
    userManager.signoutRedirect();
  },

  preloadUser: payload => ({ type: PRELOAD, payload }),

  loadGroups: () => (dispatch, getState) => {
    const state = getState()
    dispatch({type: LOADING_GROUPS, state: getState() });
    return axios.get(`${state.config.apis.accounts.url}/Account/${state.oidc.user.profile.sub}/Groups`)
    .then((msg) => {
      dispatch({type: LOADED_GROUPS, payload: { groups: msg.data.data, userId: state.oidc.user.profile.sub }})
    })
  }
})

export function reducer(state = {}, action) {
  const newState = oidc(state, action)

  switch (action.type) {
    case PRELOAD:
      return {...newState, ...action.payload, preload: true, signedIn: true, isLoadingUser: true }

    case SIGNING_OUT:
      return ({...newState, isSigningOut: true});

    case LOADING_GROUPS:
      return ({...newState, loadingGroups: true});

    case LOADED_GROUPS:
      return ({...newState, loadingGroups: false, groups: action.payload.groups })

    case 'redux-oidc/SESSION_TERMINATED':
      // Don't remove the isSigningOut flag, or AuthRoute may force sign in again on next render.
      return newState;

    default:
      return newState.isSigningOut ? {...newState, isSigningOut: false } : newState;
  }
}