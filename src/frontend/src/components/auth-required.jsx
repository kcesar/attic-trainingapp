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
    const { user } = this.props
    if (user) {
      return
    }

    sessionStorage.setItem('redirect', '/me')
    userManager.signinRedirect();
  }

  render() {
    const { user } = this.props
    return (<div>{(user && user.token_type) ? this.props.children : null }</div>)
  }
}

export default AuthRequired