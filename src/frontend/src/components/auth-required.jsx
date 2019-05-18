import React, { Component } from 'react'
import { connect } from 'react-redux'
import userManager from '../user-manager'
import * as actions from '../actions'

class AuthRequired extends Component {
  constructor(props) {
    super(props)
    this.loginIfNeeded()
  }

  componentDidUpdate() {
    this.loginIfNeeded()
  }

  loginIfNeeded() {
    const { oidc, getRoles } = this.props
    if (oidc.roles || oidc.signingOut) {
      return
    }

    if (oidc.user && oidc.user.profile) {
      return getRoles(oidc.user.profile.sub)
    }

    sessionStorage.setItem('redirect', window.location.pathname + window.location.search + window.location.hash)
    userManager.signinRedirect();
  }

  render() {
    const { oidc } = this.props || {}
    if (oidc.expired) return <div><strong>Your session has timed out.</strong></div>
    return (<div>{(oidc.user && oidc.user.token_type) ? this.props.children : null }</div>)
  }
}

const storeToProps = (store) => {
  return {
    oidc: store.oidc
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getRoles: (userId) => dispatch(actions.getRoles(userId)),
  }
}

export default connect(storeToProps, dispatchToProps)(AuthRequired);