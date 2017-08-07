import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isInRole, isSelf } from '../utils'

class Authorization extends Component {

  render() {
    console.log('authorize render')
    const { memberId, user, children, allowSelf, allowMember, showDenied } = this.props

    const isLoggedIn = user && user.access_token
    const asFullMember = (isLoggedIn && allowMember) && isInRole(user.profile, 'cdb.users')
    const asSelf = allowSelf && isSelf(user, memberId)

    return (asFullMember || asSelf) ? <div>{children}</div> : isLoggedIn ? (showDenied ? <div>no access</div> : null) : <div>loading ...</div>
  }
}

const storeToProps = (store) => {
  return {
    user: (store.oidc || {}).user,
    memberId: (store.member || {}).id
  }
}

export default connect(storeToProps, null)(Authorization);