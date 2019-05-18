import React, { Component } from 'react'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge } from 'reactstrap'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Gateway } from 'react-gateway'
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
    if (schedule && schedule.courses[task.title]) {
      const signup = schedule.courses[task.title].filter(f => f.registered !== 'no').sort((a,b) => a.registered < b.registered);
      if (signup.length) badge = signup[0].registered === 'yes' ? 'Registered' : signup[0].registered === 'wait' ? 'Wait List' : signup[0].registered
    }
    return <ListItem text={text} secondary={task.summary} onClick={this.onClick} badge={badge} loading={task.category === 'session' && (schedule||{}).loading} />
  }
}

class ListItem extends Component {
  render() {
    const { text, secondary, badge, loading } = this.props
    return <ListGroupItem tag="button" action onClick={this.props.onClick}>
    <ListGroupItemHeading className="justify-content-between" style={{flexWrap:'wrap'}}>
      {text}
      {badge ? <Badge pill>{badge}</Badge> : null}
      {loading ? <i className='fa fa-circle-o-notch fa-spin'></i> : null}
    </ListGroupItemHeading>
    <ListGroupItemText>{secondary}</ListGroupItemText>
    </ListGroupItem>
  }
}

class InfoPopup extends Component {
  render() {
    const { task } = this.props
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
      <p className='text-success'>You completed this task{record.completed === true ? '' : (' ' + record.completed.fromNow())}.</p> :
      <strong>You still need to complete this task</strong>
  }
  renderPrereqs = () => {
    const { task, progress } = this.props

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
  state = {
    leavePrompt: null,
    leaving: false,
    joinPrompt: null,
    joining: false
  }

  constructor(props) {
    super(props)
    this.renderProgress = this.renderProgress.bind(this)
    this.onConfirmLeave = this.onConfirmLeave.bind(this)
  }



  onClickLeave = (signup) => {
    this.setState({leavePrompt: signup})
  }

  onConfirmLeave = () => {
    this.setState({leaving: true})
    this.props.actions.doLeave(this.state.leavePrompt.id)
    .then(msg => {
      this.setState({ leavePrompt: null })
    })
    .catch(() => {})
    .then(() => {
      this.setState({leaving: false})
    })
  }

  onClickJoin = (session) => {
    this.setState({joining: true, joinPrompt: session})
    this.props.actions.doJoin(session.id)
    .then(msg => {
      this.setState({ joinPrompt: null })
    })
    .catch(() => {})
    .then(() => {
      this.setState({joining: false})
    })
  }

  renderLocation = (location) => {
    return location
  }

  renderProgress() {
    const {task, schedule, progress} = this.props
    const sched = schedule.courses[task.title]
    const baseContent = super.renderProgress()
    const prog = progress[task.title]

    if (!sched || prog.completed) return baseContent

    const blocked = prog.blocked && prog.blocked.length
    //const registered = !!sched.find(s => s.registered === 'yes')

    return !sched ? baseContent : <div>
      {baseContent}
      {blocked ? <div><small>You'll be able to register after completing the prerequisites</small></div>: null}
      <div>Class Schedule:</div>
      <ListGroup style={{marginBottom: '1em'}}>

      {sched.map(s => {
        const moment1 = moment(s.when)
        const moment2 = moment(s.when).add(task.hours, 'hour')
        const dates = moment1.isSame(moment2, 'day') ? moment1.format('MMM Do h:mma') :
                      (moment1.format('MMM D') + ' - ' + moment2.format(moment1.isSame(moment2, 'month') ? 'D' : 'MMM Do'))

        var signup = sched.find(f => s.id === f.id && f.registered !== 'no')

        const slotsText = `${s.current}/${s.capacity} filled` + (s.waiting ? `, ${s.waiting} waiting` : '')
        const registerText = s.current >= s.capacity || s.waiting ? 'Join Wait List' : 'Register'
        const registrationButton = s === signup
                                       ? <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickLeave(s)}>Leave</Button>
                                       : <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickJoin(s)}>
                                           {this.state.joining && s === this.state.joinPrompt ? <i className="fa fa-circle-o-notch fa-spin" style={{marginRight: 5}}></i> : null}
                                           {registerText}
                                         </Button>
        const registrationAction = blocked ? <Authorization allowAdmin>{registrationButton}</Authorization> : <Authorization allowSelf allowAdmin>{registrationButton}</Authorization>
        const registeredText = s === signup ? s.registered === 'wait' ? <span>, <strong>Wait Listed</strong></span> : <span>, <strong>Registered</strong></span> : null

        const registration = moment().isAfter(s.when) ? null : <div className='justify-content-between'><div>{slotsText}{registeredText}</div>{registrationAction}</div>

/*        let registration = blocked ? null : <div><Authorization allowSelf allowAdmin><div><Button style={{padding:0}} color="link">{registerText}</Button></div></Authorization>
        var signup = sched.find(f => s.id === f.id && f.registered !== 'no')
        if (s === signup) {
          registration = <div>{slotsText}, {s.registered === 'wait' ? 'Wait Listed' : 'Registered'} <Authorization allowSelf allowAdmin><Button style={{padding:0}} color="link" onClick={() => this.onClickLeave(s)}>Leave</Button></Authorization></div>
        } else {
          registration = <div>{slotsText}</div>
        }
*/
        return <ListGroupItem key={s.when} style={{flexDirection: 'column', alignItems:'stretch'}}>
          <div className='justify-content-between'>
            <strong>{dates}</strong>
            <span>{this.renderLocation(s.location)}</span>
          </div>
          {registration}
        </ListGroupItem>
      })}
      </ListGroup>
      { this.state.leavePrompt ? <Gateway into="root">
      <Modal isOpen={true}>
          <ModalHeader>Leave Session</ModalHeader>
          <ModalBody>
            <p>If you leave this session and then choose to re-register you may be placed at the end of a wait list.</p>
            <p> Do you want to leave the {task.title} session {moment(this.state.leavePrompt.when).calendar(null, { sameElse: '[on] MMM Do' })}?</p>
          </ModalBody>
          <ModalFooter>
            <Button disabled={this.state.leaving} color="danger" onClick={this.onConfirmLeave}>Leave{this.state.leaving ? <i style={{marginLeft:10}} className='fa fa-circle-o-notch fa-spin'></i> : null}</Button>
            <Button disabled={this.state.leaving} outline color="primary" onClick={() => this.setState({leavePrompt: null})}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Gateway> : null }
    </div>
  }
}

class OnlineInfo extends InfoPopup {
}

const infoBodyComponents = {
  session: SessionInfo,
  online: OnlineInfo,
  paperwork: InfoPopup
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
     const { progress } = this.props
     const thisProgress = progress[task.title]
     this.setState({infoDialog: this.buildInfoBody(task, thisProgress), infoTitle: task.title});
  };

   closeInfo = () => {
     this.setState({infoDialog: null, infoTitle: null})
   }

   buildInfoBody = (task, progress) => {
     const ComponentType = infoBodyComponents[task.category]
     const actions = task.category === 'session' ? { doLeave: this.props.doLeaveSession, doJoin: this.props.doJoinSession } : {}
     return ComponentType ? <ComponentType task={task} record={progress} progress={this.props.progress} schedule={this.props.schedule} actions={actions} /> : <div>No information</div>
   }

   buildListItem = (task, schedule) => {
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

