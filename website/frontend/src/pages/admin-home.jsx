import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from 'reactstrap'

import AuthRoute from '../components/auth/AuthRoute'

class AdminHomePage extends Component {
  render() {
    const { oidc } = this.props

    return <div className='container-fluid py-4'>
      <AuthRoute oidc={oidc} roles='cdb.users'>
        <ListGroup>
            <ListGroupItem tag={Link} to="/admin/trainees" action>List of Trainees</ListGroupItem>
            <ListGroupItem tag={Link} to="/admin/courses" action>Course List</ListGroupItem>
            <AuthRoute oidc={oidc} roles='acct-managers' denied=''>
              <ListGroupItem tag={Link} to="/admin/register" action>Register Trainees</ListGroupItem>
            </AuthRoute>
        </ListGroup>
      </AuthRoute>
    </div>
  }
}


const storeToProps = (store) => {
  return {
    config: store.config,
    oidc: store.oidc
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default connect(storeToProps, dispatchToProps)(AdminHomePage);