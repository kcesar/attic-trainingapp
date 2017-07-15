import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'

import AuthRequired from '../components/auth-required'
import TaskList from '../components/task-list'

class TraineePage extends Component {
  render() {
    const { user } = this.props
    return (
      <AuthRequired user={user}>
      <div>{(user && user.profile) ? user.profile.name : ''}</div>
      <TaskList {...this.props} />
      </AuthRequired>
    );
  }
}

const storeToProps = (store) => {
  return {
    user: store.oidc ? store.oidc.user : undefined,
    tasks: store.tasks,
    records: store.records,
    progress: store.progress
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getUserData: () => dispatch(actions.getUserData())
  }
}

export default connect(storeToProps, dispatchToProps)(TraineePage);