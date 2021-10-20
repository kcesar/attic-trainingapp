import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import moment from 'moment';

import MarkdownItem from '../MarkdownItem';
import { TrainingTask } from '../../models/task';
import { TaskProgress } from '../../models/taskProgress';

export interface InfoPopupProps {
  task: TrainingTask,
  record: TaskProgress,
  progress: {[title:string]: TaskProgress }
}

export class InfoPopup<T extends InfoPopupProps, S = {}> extends Component<T, S> {
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
        <div>
          <span className='fa-stack'>
            <i className='far fa-square fa-stack-1x'/>
            {progress[p].completed ? <i className='fas fa-check fa-stack-1x text-success'></i> : ''}
          </span>
          {p}
        </div>
      </ListGroupItem>
    )

    return data.length ? <div><h6>Prerequisites:</h6><ListGroup>{data}</ListGroup></div> : null
  }
}

export default class InfoPopupImpl extends InfoPopup<InfoPopupProps> { }