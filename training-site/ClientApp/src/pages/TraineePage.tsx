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


  const body = store.loadingTrainee || !store.user
                  ? <div>Loading ...</div>
                  : !store.viewTrainee
                    ? <div>No Training Information</div>
                    : <>
                      <div>{store.viewTrainee?.name}</div>
                      <TaskList tasks={store.taskList} progress={store.progress} schedule={store.schedule} store={store} trainee={store.viewTrainee} />
                    </>

  return (
    <div className='container-fluid py-4'>
      {body}
    </div>
  );
}

export default observer(TraineePage);