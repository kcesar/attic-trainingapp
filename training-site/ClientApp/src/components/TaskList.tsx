import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Schedule } from '../models/schedule';
import { TrainingTask } from '../models/task';
import { TaskProgress } from '../models/taskProgress';
import { Trainee } from '../models/trainee';
import { TrainingStore } from '../store';
import { ListGroup, ListItem, Subheader } from './List';
import InfoPopup from './task-details/infoPopup';
import SessionPopup from './task-details/SessionPopup';
import TaskListItem from './TaskListItem';

class OnlineInfo extends InfoPopup {
}

export const TaskList :React.FC<{tasks: TrainingTask[], progress: {[title:string]: TaskProgress}, schedule: Schedule, trainee: Trainee, store:TrainingStore}>
 = ({tasks, progress, schedule, trainee, store}) => {
  const [infoOpen, setInfoOpen] = React.useState<boolean>(false);
  const [infoTitle, setInfoTitle] = React.useState<string>('');
  const [infoBody, setInfoBody] = React.useState<React.ReactNode>(undefined);

  function buildInfoBody(task: TrainingTask, p: TaskProgress) {
    if (task.category === 'paperwork') return (<InfoPopup task={task} record={p} progress={progress} />);
    else if (task.category === 'online') return (<OnlineInfo task={task} record={p} progress={progress} />);
    else if (task.category === 'session') {
      return (<SessionPopup task={task} record={p} progress={progress} store={store} trainee={trainee} />);
    }
    return (<div>No Information</div>);
  }

  function openInfo(task: TrainingTask) {
    setInfoOpen(true);
    setInfoBody(buildInfoBody(task, progress[task.title]));
  }
  
  function buildListItem(task :TrainingTask) {
    return <TaskListItem key={task.title} task={task} onPick={openInfo} schedule={schedule} />
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
        {tasks.filter(t => progress[t.title]?.available).map(t => buildListItem(t))}
        </ListGroup>
        <Subheader>Blocked Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter(t => progress[t.title]?.blocked).map(t => buildListItem(t))}
        </ListGroup>
        <Subheader>Completed Tasks</Subheader>
        <ListGroup className='indent'>
        {tasks.filter(t => progress[t.title]?.completed).map(t => buildListItem(t))}
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