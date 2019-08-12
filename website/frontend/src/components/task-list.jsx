import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { ListGroup, ListItem, Subheader } from './List'
import InfoPopup from './InfoPopup'
import SessionPopup from './SessionPopup'

class TaskListItem extends Component {
  onClick = () => {
    this.props.onPick(this.props.task)
  }

  render() {
    const { task, schedule, member } = this.props
    const text = task.title
    let badge = null
    if (schedule && schedule.courses[task.title]) {
      const signup = schedule.courses[task.title].filter(f => f.registered !== 'no').sort((a,b) => a.registered < b.registered);
      if (signup.length) badge = signup[0].registered === 'yes' ? 'Registered' : signup[0].registered === 'wait' ? 'Wait List' : signup[0].registered
    }
    return <ListItem text={text} secondary={task.summary} onClick={this.onClick} badge={badge} loading={task.category === 'session' && (schedule||{}).loading} member={member} />
  }
}

class OnlineInfo extends InfoPopup {
}

const infoBodyComponents = {
  session: SessionPopup,
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

  componentDidUpdate(prevProps) {
    if (this.state.currentTask && (this.props.progress !== prevProps.progress)) this.openTaskInfo(this.state.currentTask)
  }

   openTaskInfo = (task) => {
     const { progress } = this.props
     const thisProgress = progress[task.title]
     this.setState({infoDialog: this.buildInfoBody(task, thisProgress), infoTitle: task.title, currentTask: task});
  };

   closeInfo = () => {
     this.setState({infoDialog: null, infoTitle: null, currentTask: null})
   }

   buildInfoBody = (task, progress) => {
     const ComponentType = infoBodyComponents[task.category]
     const actions = task.category === 'session' ? { doLeave: this.props.doLeaveSession, doJoin: this.props.doJoinSession } : {}
     return ComponentType ? <ComponentType task={task} record={progress} progress={this.props.progress} schedule={this.props.schedule} actions={actions} member={this.props.member} /> : <div>No information</div>
   }

   buildListItem = (task, member, schedule) => {
     return <TaskListItem key={task.title} task={task} onPick={this.openTaskInfo} schedule={schedule} member={member} />
   }

  render() {
    const { tasks, records, progress, schedule, member } = this.props

    return <div>
        <Subheader>Personal Information</Subheader>
        <ListGroup className='indent'>
        <ListItem text='Contact Information' secondary='Address, Email, Phone number'/>
        <ListItem text='Emergency Contacts' secondary='Who to call in an emergency'/>
        </ListGroup>
        <Subheader>Available Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].available).map((i) => this.buildListItem(i, member, schedule))}
        </ListGroup>
        <Subheader>Blocked Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].blocked).map((i) => this.buildListItem(i, member, schedule))}
        </ListGroup>
        <Subheader>Completed Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].completed).map((i) => this.buildListItem(i, member))}
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

