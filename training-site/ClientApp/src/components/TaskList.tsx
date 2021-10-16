import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Schedule } from '../models/schedule';
import { TrainingTask } from '../models/task';
import { TaskProgress } from '../models/taskProgress';
import { ListGroup, ListItem, Subheader } from './List';
import InfoPopup from './task-details/infoPopup';
import SessionPopup from './task-details/SessionPopup';
import TaskListItem from './TaskListItem';

class OnlineInfo extends InfoPopup {
}

export const TaskList :React.FC<{tasks: TrainingTask[], progress: {[title:string]: TaskProgress}, schedule: Schedule}> = ({tasks, progress, schedule}) => {
  const [infoOpen, setInfoOpen] = React.useState<boolean>(false);
  const [infoTitle, setInfoTitle] = React.useState<string>('');
  const [infoBody, setInfoBody] = React.useState<React.ReactNode>(undefined);

  function buildInfoBody(task: TrainingTask, p: TaskProgress) {
    if (task.category == 'paperwork') return (<InfoPopup task={task} record={p} progress={progress} />);
    else if (task.category == 'online') return (<OnlineInfo task={task} record={p} progress={progress} />);
    else if (task.category == 'session') {
      const actions = /*task.category === 'session' ? { doLeave: this.props.doLeaveSession, doJoin: this.props.doJoinSession } :*/ {};
      return (<SessionPopup task={task} record={p} progress={progress} schedule={schedule[task.title]} actions={actions} />);
    }
    return (<div>No Information</div>);
  }

  function openInfo(task: TrainingTask) {
    setInfoOpen(true);
    setInfoBody(buildInfoBody(task, progress[task.title]));
  }
  
  function buildListItem(task :TrainingTask, member?: any, schedule?: any) {
    return <TaskListItem key={task.title} task={task} onPick={openInfo} schedule={schedule} member={member} />
  }

  return (
    <div>
      <Subheader>Personal Information</Subheader>
      <ListGroup className='indent'>
        <ListItem text='Contact Information' secondary='Address, Email, Phone number'/>
        <ListItem text='Emergency Contacts' secondary='Who to call in an emergency'/>
        </ListGroup>
        <Subheader>Available Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title]?.available).map((i) => buildListItem(i/*, member, schedule*/))}
        </ListGroup>
        <Subheader>Blocked Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title]?.blocked).map((i) => buildListItem(i/*, member, schedule*/))}
        </ListGroup>
        <Subheader>Completed Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter((i) => progress[i.title]?.completed).map((i) => buildListItem(i/*, member*/))}
        </ListGroup>
        <Modal isOpen={false/*!!records.loading*/}><ModalBody>Loading ...</ModalBody></Modal>
        <Modal isOpen={!!infoOpen} toggle={() => setInfoOpen(false)}>
          <ModalHeader toggle={() => setInfoOpen(false)}>{infoTitle}</ModalHeader>
          <ModalBody>{infoBody}</ModalBody>
          <ModalFooter><Button color="outline-primary" onClick={() => setInfoOpen(false)}>Close</Button></ModalFooter>
        </Modal>
    </div>
  )
}