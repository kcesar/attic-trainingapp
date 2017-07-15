import React, { Component } from 'react'
import { List, ListItem, Subheader, Dialog, FlatButton, Divider } from 'material-ui'
import marked from 'marked'

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
    return <ListItem primaryText={text} secondaryText={task.summary} insetChildren={true} onTouchTap={this.onClick}  />
  }
}

class SessionInfo extends Component {
  render() {
    const { task, record } = this.props
    return <div>
      <h4 className='dialog-subtitle'>{task.summary}</h4>
      <MarkdownItem markdown={task.details} />
      <Divider />
      {JSON.stringify(record)}
    </div>
  }
}

class OnlineInfo extends Component {
  render() {
    const { task, record } = this.props
    return <div>
      <h4 className='dialog-subtitle'>{task.summary}</h4>
      <MarkdownItem markdown={task.details} />
      <Divider />
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
    const dialogActions = this.state.infoDialog ? [
      <FlatButton label="Close" primary={true} onTouchTap={this.closeInfo}/>
    ] : []

    return <List>
        <Subheader>Personal Information</Subheader>
        <ListItem primaryText='Contact Information' secondaryText='Address, Email, Phone number' insetChildren={true} />
        <ListItem primaryText='Emergency Contacts' secondaryText='Who to call in an emergency' insetChildren={true} />
        <Subheader>Available Tasks</Subheader>
        {tasks.filter((i) => progress[i.title] && progress[i.title].available).map((i) => this.buildListItem(i))}
        <Subheader>Blocked Tasks</Subheader>
        {tasks.filter((i) => progress[i.title] && progress[i.title].blocked).map((i) => this.buildListItem(i))}
        <Subheader>Completed Tasks</Subheader>
        {tasks.filter((i) => progress[i.title] && progress[i.title].completed).map((i) => this.buildListItem(i))}
        <Dialog open={!!records.loading}><div>Loading ...</div></Dialog>
        <Dialog open={!!this.state.infoDialog} onRequestClose={this.closeInfo} actions={dialogActions} title={this.state.infoTitle}><div>{this.state.infoDialog}</div></Dialog>
      </List>
  }
}

export default TaskList