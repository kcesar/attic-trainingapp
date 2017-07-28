import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isInRole } from '../utils'

class Authorization extends Component {

  render() {
    const { memberId, user, children, allowSelf, allowMember } = this.props
    
    const isLoggedIn = user && user.access_token
    const asFullMember = (isLoggedIn && allowMember) ? isInRole(user.profile, 'cdb.users') : false
    const asSelf = isLoggedIn && allowSelf ? (user.profile.memberId ||'').toLowerCase() === (memberId || '').toLowerCase() : false


  return  (asFullMember || asSelf) ? <div>{children}</div> : isLoggedIn ? <div>no access</div> : <div>blah</div>
  }
}

const storeToProps = (store) => {
  return {
    user: (store.oidc || {}).user,
    memberId: (store.member || {}).id
  }
}

export default connect(storeToProps, null)(Authorization);