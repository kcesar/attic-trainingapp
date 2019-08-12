import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap'
import moment from 'moment'

import AuthRoute from '../components/auth/AuthRoute'
import * as actions from '../actions'

class CourseRosterPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      courseId: props.match.params.courseId,
      display: 'table',
      loaded: false
    }
  }
  componentDidMount() {
    console.log('did mount')
    if ((this.props.oidc.user||{}).access_token) this.props.getScheduleData()
  }

  componentDidUpdate(prevProps) {
    if ((this.props.oidc.user||{}.access_token) && !(prevProps.oidc.user||{}).access_token && !this.props.schedule.loaded)
     this.props.getScheduleData()
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('will update')

    if (!this.state.offering && nextProps.schedule.loaded) {
    //if (!this.props.schedule.loaded && nextProps.schedule.loaded
      const courses = nextProps.schedule.courses
      const titles = Object.keys(courses)

      const offering = titles.reduce((prevT, curT) =>
      prevT || courses[curT].reduce((prevO, curO) =>
        prevO || (curO.id === parseInt(nextState.courseId, 10) ? { title: curT, offering: curO} : null),
        null),
      null)

      this.setState({ offering })

      this.props.getRosterData(offering.title, offering.offering)
      .then(()=> this.setState({loaded: true}))
    }
  }

  getTrainee(memberId) {
    const { trainees } = this.props
    var trainee = (trainees.items||[]).find(f => f.id.toLowerCase() === memberId.toLowerCase())
    return trainee
  }

  renderTable(roster) {
    return <Table>
      <thead><tr><th>Last Name</th><th>First Name</th>{/*<th>Adult/Youth</th><th>Gender</th>*/}<th>Email</th><th>Phone</th><th>Wait List?</th></tr></thead>
      <tbody>
        {roster.items.map(r => {
          const trainee = this.getTrainee(r.memberId)
          const contacts = (trainee||{}).contacts || []
          return <tr key={r.id}>
          {trainee ? <td>{trainee.last}</td> : <td colSpan="2">{r.name}</td>}
          {trainee ? <td>{trainee.first}</td> : null}
          {/* <td></td>
          <td>{(trainee||{}).gender}</td> */}
          <td>{(contacts.find(f => f.type === 'email')||{}).value}</td>
          <td>{(contacts.find(f => f.type === 'phone')||{}).value}</td>
          <td>{r.onWaitList ? <i className="fa fa-hourglass"></i> : null}</td>
          </tr>})}
        </tbody>
      </Table>
  }

  render() {
    const { oidc, roster } = this.props
    
    const course = this.state.offering || {}
    const session = course.offering
    
    return (<div className='container-fluid py-4'>
      <AuthRoute oidc={oidc} denied='Access denied'>
        <Link to="/admin/courses">&lt; Course List</Link>
        <div>Course Roster for {course.title || <i className='fa fa-spin fa-circle-o-notch'></i>}</div>
        {session ? <div>{moment(session.when).format("HHmm ddd MMM Do")}</div> : null}
        {this.state.loaded && roster.loaded ?
          this.renderTable(roster)
          : <div>Loading ...</div>
        }
      </AuthRoute>
    </div>)
  }
}


const storeToProps = (store) => {
  return {
    config: store.config,
    oidc: store.oidc,
    schedule: store.schedule,
    roster: store.roster,
    trainees: store.trainees
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getScheduleData: () => dispatch(actions.getSchedule(false)),
    getRosterData: (courseName, session) => dispatch(actions.getRoster(courseName, session))
  }
}

export default connect(storeToProps, dispatchToProps)(CourseRosterPage);