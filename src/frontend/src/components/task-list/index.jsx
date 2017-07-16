import React, { Component } from 'react'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import marked from 'marked'

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
    const { task } = this.props
    const text = task.title
    return <ListItem text={text} secondary={task.summary} onClick={this.onClick} />
  }
}

class ListItem extends Component {
  render() {
    const { text, secondary } = this.props
    return <ListGroupItem tag="button" action onClick={this.props.onClick}>
    <ListGroupItemHeading>{text}</ListGroupItemHeading>
    <ListGroupItemText>{secondary}</ListGroupItemText>
    </ListGroupItem>
  }
}

class SessionInfo extends Component {
  render() {
    const { task, record } = this.props
    return <div>
      <h5 className='dialog-subtitle'>{task.summary}</h5>
      <MarkdownItem markdown={task.details} />
     <hr/>
      {JSON.stringify(record)}
    </div>
  }
}

class OnlineInfo extends Component {
  render() {
    const { task, record } = this.props
    return <div>
      <h5 className='dialog-subtitle'>{task.summary}</h5>
      <MarkdownItem markdown={task.details} />
      <hr />
      <p>{(record && record.completed && !record.expires) ? 'You completed this task ' + record.completed.fromNow() : 'You still need to complete this online task' }</p>
    </div>
  }
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
    const { getUserData } = this.props;
    getUserData()
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
     return ComponentType ? <ComponentType task={task} record={record} /> : <div>No information</div>
   }

   buildListItem = (task) => {
     return <TaskListItem key={task.title} task={task} onPick={this.openTaskInfo} />
   }

  render() {
    const { tasks, records, progress } = this.props

    return <div>
        <Subheader>Personal Information</Subheader>
        <ListGroup className='indent'>
        <ListItem text='Contact Information' secondary='Address, Email, Phone number'/>
        <ListItem text='Emergency Contacts' secondary='Who to call in an emergency'/>
        </ListGroup>
        <Subheader>Available Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].available).map((i) => this.buildListItem(i))}
        </ListGroup>
        <Subheader>Blocked Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title] && progress[i.title].blocked).map((i) => this.buildListItem(i))}
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

