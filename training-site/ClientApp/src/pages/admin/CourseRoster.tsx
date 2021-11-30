import * as React from 'react';
import { observer } from 'mobx-react';
import { Link, useParams } from 'react-router-dom';

import { AdminStore } from '../../adminStore';
import { Table } from 'reactstrap';
import moment from 'moment';


export const CourseRosterPage :React.FC<{store:AdminStore}> = ({store}) => {
  const { id } = useParams<{id: string}>();
  React.useEffect(() => {
    store.loadRoster(parseInt(id));
  }, [store]);

  return (
    <div className='container-fluid py-4'>
      <Link to="/admin/courses">&lt; Course List</Link>
      <div>{store.roster?.course.title}</div>
      {store.roster ? <div>{moment(store.roster.session.when).format("HHmm ddd MMM Do")}</div> : null}
      <Table>
      <thead><tr><th>Last Name</th><th>First Name</th>{/*<th>Adult/Youth</th><th>Gender</th>*/}<th>Email</th><th>Phone</th><th>Wait List?</th></tr></thead>
      <tbody>
        {store.roster?.trainees.map(r => {
          return (<tr key={r.id}>
            <td>{r.lastName}</td>
            <td>{r.firstName}</td>
            {/* <td></td>
            <td>{(trainee||{}).gender}</td> */}
            <td>{r.email}</td>
            <td>{r.phone}</td>
            <td>{r.onWaitList ? <i className="fa fa-hourglass"></i> : null}</td>
          </tr>
          );
        }) ?? <tr><td>Loading ...</td></tr>}
        </tbody>
        </Table>
    </div>
  );
}

export default observer(CourseRosterPage);