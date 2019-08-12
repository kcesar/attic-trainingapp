import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import * as actions from '../actions'

import AuthRoute from '../components/auth/AuthRoute'
import TaskList from '../components/task-list'

class TraineePage extends Component {
  render() {
    const { member } = this.props
    return (
      <div className='container-fluid py-4'>
        <AuthRoute roles='cdb.users' denied='' loading=''>
          <div><Link to='/admin/trainees'>&lt; Trainees List</Link></div>
        </AuthRoute>
        <AuthRoute self={member.id} roles='cdb.users'>
          <div>{member ? member.name : ''}</div>
          <TaskList {...this.props} member={member} />
        </AuthRoute>
      </div>
    );
  }
}

const storeToProps = (store) => {
  return {
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
    getSchedule: () => dispatch(actions.getSchedule(true)),
    doLeaveSession: (session) => dispatch(actions.doLeaveSession(session)),
    doJoinSession: (session) => dispatch(actions.doJoinSession(session))
  }
}

export default connect(storeToProps, dispatchToProps)(TraineePage);