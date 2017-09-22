import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap'

import AuthRequired from '../components/auth-required'
import Authorization from '../components/authorization'

class AdminHomePage extends Component {
  render() {
    const { oidc } = this.props

    return <div className='container-fluid py-4'>
        <AuthRequired oidc={oidc}>
          <Authorization allowMember showDenied>
            <ListGroup>
              <ListGroupItem tag={Link} to="/admin/trainees" action>List of Trainees</ListGroupItem>
              <ListGroupItem tag={Link} to="/admin/courses" action>Course List</ListGroupItem>
            </ListGroup>
          </Authorization>
        </AuthRequired>
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