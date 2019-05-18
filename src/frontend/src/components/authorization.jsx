import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isInRole, isSelf } from '../utils'

class Authorization extends Component {

  render() {
    const { memberId, user, roles, children, group, allowSelf, allowMember, allowAdmin, showDenied } = this.props

    const isLoggedIn = user && user.access_token
    const asFullMember = (isLoggedIn && allowMember) && isInRole(roles, 'cdb.users')
    const asAdmin = (isLoggedIn && allowAdmin) && isInRole(roles, 'esar.training')
    const asSelf = allowSelf && isSelf(user, memberId)
    const inGroup = group && isInRole(roles, group)

    return (inGroup || asFullMember || asSelf || asAdmin) ? <div>{children}</div> : isLoggedIn ? (showDenied ? <div>no access</div> : null) : <div>loading ...</div>
  }
}

const storeToProps = (store) => {
  return {
    user: (store.oidc || {}).user,
    roles: (store.oidc || {}).roles,
    memberId: (store.member || {}).id
  }
}

export default connect(storeToProps, null)(Authorization);