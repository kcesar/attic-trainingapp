import * as React from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';

import { TaskList } from '../components/TaskList';
import { TrainingStore } from '../store';


export const TraineePage :React.FC<{store:TrainingStore}> = ({store}) => {
  const { id } = useParams<{id: string}>();
  
  React.useEffect(() => {
    store.loadTrainee(id);
  }, [id, store]);

  return (
    store.viewTrainee
    ? <div className='container-fluid py-4'>
      {store.viewTrainee?.name}
      <TaskList tasks={store.taskList} progress={store.progress} schedule={store.schedule} />
    </div>
    : <div>No Training Information</div>
  );
}

export default observer(TraineePage);