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

  let body = <TaskList tasks={store.taskList} progress={store.progress} schedule={store.schedule} />;
  if (!store.viewTrainee) body = <div>No Training Information</div>;
  if (store.loadingTrainee) body = <div>Loading ...</div>;

  return (
    <div className='container-fluid py-4'>
      {body}
    </div>
  );
}

export default observer(TraineePage);