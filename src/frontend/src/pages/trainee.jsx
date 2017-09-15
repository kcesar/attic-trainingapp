import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'

import AuthRequired from '../components/auth-required'
import Authorization from '../components/authorization'
import TaskList from '../components/task-list'

class TraineePage extends Component {
  render() {
    console.log('traineepage', member)
    const { member, oidc } = this.props
    return (
      <div className='container-fluid py-4'>
        <AuthRequired oidc={oidc}>
          <Authorization allowSelf allowMember showDenied>
            <div>{member ? member.name : ''}</div>
            <TaskList {...this.props} />
          </Authorization>
        </AuthRequired>
      </div>
    );
  }
}

const storeToProps = (store) => {
  return {
    oidc: store.oidc,
    member: store.member,
    tasks: store.tasks,
    records: store.records,
    progress: store.progress,
    schedule: store.schedule
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getUserData: () => dispatch(actions.getUserData()),
    getSchedule: () => dispatch(actions.getSchedule()),
    doLeaveSession: (session) => dispatch(actions.doLeaveSession(session)),
    doJoinSession: (session) => dispatch(actions.doJoinSession(session))
  }
}

export default connect(storeToProps, dispatchToProps)(TraineePage);