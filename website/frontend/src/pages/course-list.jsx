import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Table } from 'reactstrap'

import moment from 'moment'

import * as actions from '../actions'

import AuthRequired from '../components/auth-required'
import Authorization from '../components/authorization'

class CourseListPage extends Component {
  constructor(props) {
    super(props)
    this.state = {current: props.tasks[0].title}
  }

  componentWillMount(nextprops) {
    this.props.getScheduleData()
  }

  render() {
    const { oidc, tasks, schedule, config } = this.props
    
    const list = (
      <ListGroup>
        {
          tasks.map(t =>
            <ListGroupItem key={t.title} style={{flexDirection:'column', alignItems:'stretch'}} active={this.state.current === t} action
              onClick={() => this.setState({current: this.state.current === t ? null : t })}>
              <ListGroupItemHeading>{t.title}</ListGroupItemHeading>
              {this.state.current === t
               ? <ListGroupItemText style={{color:'#212121'}} tag="div">
                 { schedule.loaded ?
                <Table style={{backgroundColor: 'white'}}>
                 <thead><tr><th>Date</th><th>Capacity</th><th>Registered</th><th>Wait List</th></tr></thead>
                 <tbody>
                 {(schedule.courses[t.title]||[]).map(o => 
                  <tr style={moment().add('day', -2).isBefore(o.when) ? null : {textDecoration:'line-through'}} key={o.id}>
                    <td>{moment(o.when).format("HHmm ddd MMM Do")}</td>
                    <td>{o.capacity}</td>
                    <td>{o.current}</td>
                    <td>{o.waiting}</td>
                    <td>
                      <AuthRequired oidc={oidc}>
                      <Authorization allowMember>
                        <Link to={`${config.localRoot}/admin/courses/${o.id}`}>Roster</Link>
                      </Authorization>
                    </AuthRequired>
                    </td>
                    </tr>
                 )}
                 </tbody>
                 </Table> : <div><i className='fa fa-spin fa-circle-o-notch'></i> Loading ...</div> }
                 </ListGroupItemText>
               : null}
            </ListGroupItem>
          )
        }
      </ListGroup>
    )

    return <div className='container-fluid py-4'>
        <AuthRequired oidc={oidc}>
          <Authorization allowMember showDenied>
            <Link to="/admin">&lt; Admin Home</Link>
            <div>Course List</div>
            {list}
          </Authorization>
        </AuthRequired>
      </div>
  }
}


const storeToProps = (store) => {
  return {
    config: store.config,
    oidc: store.oidc,
    schedule: store.schedule,
    tasks: store.tasks.filter(f => f.category === 'session')
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getScheduleData: () => dispatch(actions.getSchedule(false)),
  }
}

export default connect(storeToProps, dispatchToProps)(CourseListPage);