import React, { Component } from 'react'
import userManager from '../user-manager'

class AuthRequired extends Component {
  constructor(props) {
    super(props)
    this.loginIfNeeded()
  }

  componentDidUpdate() {
    this.loginIfNeeded()
  }

  loginIfNeeded() {
    const { oidc } = this.props
    if (oidc.user || oidc.signingOut) {
      return
    }

    sessionStorage.setItem('redirect', window.location.pathname + window.location.search + window.location.hash)
    userManager.signinRedirect();
  }

  render() {
    const { oidc } = this.props || {}
    return (<div>{(oidc.user && oidc.user.token_type) ? this.props.children : null }</div>)
  }
}

export default AuthRequired