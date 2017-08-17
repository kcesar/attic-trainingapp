import React, { Component } from 'react'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge } from 'reactstrap'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import marked from 'marked'
import moment from 'moment'

import Authorization from '../authorization'

class Subheader extends Component {
  render() {
    return <p className='text-muted' style={{marginTop: '1rem'}}>{this.props.children}</p>
  }
}

class MarkdownItem extends Component {
  render() {
    const rawMarkup = marked(this.props.markdown || '', {sanitize: true});
    return <div dangerouslySetInnerHTML={{__html: rawMarkup}} />
  }
}

class TaskListItem extends Component {
  onClick = () => {
    this.props.onPick(this.props.task)
  }

  render() {
    const { task, schedule } = this.props
    const text = task.title
    let badge = null
    if (schedule && schedule[task.title]) {
      const signup = schedule[task.title].find(f => f.registered !== 'no')
      if (signup) badge = signup.registered === 'yes' ? 'Registered' : signup.registered === 'wait' ? 'Wait List' : signup.registered
    }
    return <ListItem text={text} secondary={task.summary} onClick={this.onClick} badge={badge} />
  }
}

class ListItem extends Component {
  render() {
    const { text, secondary, badge } = this.props
    return <ListGroupItem tag="button" action onClick={this.props.onClick}>
    <ListGroupItemHeading className="justify-content-between" style={{flexWrap:'wrap'}}>{text}{badge ? <Badge pill>{badge}</Badge> : null}</ListGroupItemHeading>
    <ListGroupItemText>{secondary}</ListGroupItemText>
    </ListGroupItem>
  }
}

class InfoPopup extends Component {
  render() {
    const { task, tasks } = this.props
    const pBody = this.renderProgress()
    const bBody = this.renderPrereqs()
    return <div>
      <h5 className='dialog-subtitle'>{task.summary}</h5>
      {this.renderBody()}
      {pBody || bBody ? <hr /> : null}
      {pBody}
      {bBody}
    </div>
  }
  renderBody = () => {
    const { task } = this.props
    return <MarkdownItem markdown={task.details} />
  }
  renderProgress() {
   const { record } = this.props
    return record && record.completed && (!record.expires || record.expires.isAfter(moment())) ?
      <p className='text-success'>You completed this task {record.completed.fromNow()}</p> :
      <strong>You still need to complete this task</strong>
  }
  renderPrereqs = () => {
    const { record, tasks, task, progress } = this.props

    const data = (task.prereqs || []).map(p =>
      <ListGroupItem key={p}>
        <div className='hanging-fa-fw'>
        <i className={`fa fa-fw ${progress[p].completed ? 'fa-check-square-o text-success' : 'fa-square-o'}`}></i>
        {p}</div>
      </ListGroupItem>
    )

    return data.length ? <div><h6>Prerequisites:</h6><ListGroup>{data}</ListGroup></div> : null
  }
}

class SessionInfo extends InfoPopup {
  constructor(props) {
    super(props)
    this.renderProgress = this.renderProgress.bind(this)
  }

  renderLocation = (location) => {
    return location
  }

  renderProgress() {
    const {task, schedule, progress} = this.props
    const sched = schedule[task.title]
    const baseContent = super.renderProgress()
    const prog = progress[task.title]

    if (!sched || prog.completed) return baseContent

    const blocked = prog.blocked && prog.blocked.length


    const signup = sched.find(s => s.registered && s.registered !== 'no')

    return !sched ? baseContent : <div>
      {baseContent}
      { blocked ? <div><small>You'll be able to register after completing the prerequisites</small></div>: null}
      <div>Class Schedule:</div>
      <ListGroup style={{marginBottom: '1em'}}>
      {sched.map(s => {
        const moment1 = moment(s.when)
        const moment2 = moment(s.when).add(task.hours, 'hour')
        const dates = moment1.isSame(moment2, 'day') ? moment1.format('MMM Do') :
                      (moment1.format('MMM D') + ' - ' + moment2.format(moment1.isSame(moment2, 'month') ? 'D' : 'MMM Do'))


      let registration = blocked ? null : <Authorization allowSelf><div><Button style={{padding:0}} color="link">Register</Button></div></Authorization>
        if (signup) {
          if (s === signup) {
            registration = <div>{s.registered === 'wait' ? 'Wait List' : 'Registered'} <Authorization allowSelf><Button style={{padding:0}} color="link">Leave</Button></Authorization></div>
          } else {
            registration = null
          }
        }
        return <ListGroupItem key={s.when} style={{flexDirection: 'column', alignItems:'stretch'}}>
          <div className='justify-content-between'>
            <strong>{dates}</strong>
            <span>{this.renderLocation(s.location)}</span>
          </div>
          {registration}
        </ListGroupItem>
      })}
      </ListGroup>
    </div>
  }
}

class OnlineInfo extends InfoPopup {
}

const infoBodyComponents = {
  session: SessionInfo,
  online: OnlineInfo
}

class TaskList extends Component {
  state = {
    infoDialog: null,
    infoTitle: null
  }

  componentWillMount() {
    const { getUserData, getSchedule } = this.props;
    getUserData()
    getSchedule()
  }

   openTaskInfo = (task) => {
     const { records } = this.props
     const record = records.items[task.title]
     this.setState({infoDialog: this.buildInfoBody(task, record), infoTitle: task.title});
  };

   closeInfo = () => {
     this.setState({infoDialog: null, infoTitle: null})
   }

   buildInfoBody = (task, record) => {
     const ComponentType = infoBodyComponents[task.category]
     return ComponentType ? <ComponentType task={task} record={record} progress={this.props.progress} schedule={this.props.schedule} /> : <div>No information</div>
   }

   buildListItem = (task, schedule, available) => {
     return <TaskListItem key={task.title} task={task} onPick={this.openTaskInfo} schedule={schedule} />
   }

  render() {
    const { tasks, records, progress, schedule } = this.props

    return <div>
        <Subheader>Personal Information</Subheader>
        <ListGroup className='indent'>
        <ListItem text='Contact Information' secondary='Address, Email, Phone number'/>
        <ListItem text='Emergency Contacts' secondary='Who to call in an emergency'/>
        </ListGroup>
        <Subheader>Available Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].available).map((i) => this.buildListItem(i, schedule))}
        </ListGroup>
        <Subheader>Blocked Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].blocked).map((i) => this.buildListItem(i, schedule))}
        </ListGroup>
        <Subheader>Completed Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].completed).map((i) => this.buildListItem(i))}
        </ListGroup>
        <Modal isOpen={!!records.loading}><ModalBody>Loading ...</ModalBody></Modal>
        <Modal isOpen={!!this.state.infoDialog} toggle={this.closeInfo}>
          <ModalHeader toggle={this.closeInfo}>{this.state.infoTitle}</ModalHeader>
          <ModalBody>{this.state.infoDialog}</ModalBody>
          <ModalFooter><Button color="outline-primary" onClick={this.closeInfo}>Close</Button></ModalFooter>
        </Modal>
      </div>
  }
}

export default TaskList

