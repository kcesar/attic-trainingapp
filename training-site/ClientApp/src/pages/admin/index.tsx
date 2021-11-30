import * as React from 'react';
import { Link, Route, useRouteMatch } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { TrainingStore } from '../../store';
import { AdminStore } from '../../adminStore';

import CourseListPage from './CourseList';
import CourseRosterPage from './CourseRoster';

export const AdminHomePage :React.FC<{store:TrainingStore}> = ({store}) => {
  const adminStore = React.useMemo(() => new AdminStore(store), [store]);
  const { url } = useRouteMatch();
  return (
  <>
    <Route exact path={`${url}/`}>
      <ListGroup>
        <ListGroupItem tag={Link} to={`${url}/trainees`} action>List of Trainees</ListGroupItem>
        <ListGroupItem tag={Link} to={`${url}/courses`} action>Course List</ListGroupItem>
        {/* <AuthRoute oidc={oidc} roles='acct-managers' denied=''>
          <ListGroupItem tag={Link} to="/admin/register" action>Register Trainees</ListGroupItem>
        </AuthRoute> */}
      </ListGroup>
    </Route>
    <Route path={`${url}/courses`} exact><CourseListPage store={adminStore} /></Route>
    <Route path={`${url}/courses/:id`} exact><CourseRosterPage store={adminStore} /></Route>
  </>
  );
}

export default AdminHomePage;