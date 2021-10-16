import { Component } from "react"
import { Schedule } from "../models/schedule"
import { TrainingTask } from "../models/task"
import { ListItem } from "./List"

export interface TaskListItemProps {
  task: TrainingTask;
  schedule: Schedule;
  member: any;
  onPick: (task: TrainingTask) => void;
}

export class TaskListItem extends Component<TaskListItemProps> {
  onClick = () => {
    this.props.onPick(this.props.task)
  }

  render() {
    const { task, schedule } = this.props
    const text = task.title
    let badge :string|undefined = undefined;
    if (schedule && schedule[task.title]) {
      const signup = schedule[task.title].filter(f => f.registered !== 'no').sort((a,b) => (a.registered ?? '') < (b.registered ?? '') ? -1 : (b.registered ?? '') < (a.registered ?? '') ? 1 : 0);
      if (signup.length) badge = signup[0].registered === 'yes' ? 'Registered' : signup[0].registered === 'wait' ? 'Wait List' : signup[0].registered
    }
    return <ListItem text={text} secondary={task.summary} onClick={this.onClick} badge={badge} loading={false /*task.category === 'session' && (schedule||{}).loading*/} />
  }
}

export default TaskListItem