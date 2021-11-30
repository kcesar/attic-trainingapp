import * as React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import { AdminStore } from '../../adminStore';
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Table } from 'reactstrap';
import moment from 'moment';


export const CourseListPage :React.FC<{store:AdminStore}> = ({store}) => {
  return (
    <div className='container-fluid py-4'>
      <Link to="/admin">&lt; Admin Home</Link>
      <div>Course List</div>
      <ListGroup>
        {store.courseList.map(c => (
          <ListGroupItem key={c.title} style={{flexDirection:'column', alignItems:'stretch'}} active={store.selectedCourse === c.title} action
            onClick={() => store.selectCourse(store.selectedCourse === c.title ? undefined : c.title)}
          >
            <ListGroupItemHeading>{c.title}</ListGroupItemHeading>
            {store.selectedCourse === c.title
              ? <ListGroupItemText style={{color:'#212121'}} tag="div">
                { c.adminSchedule ?
                <Table style={{backgroundColor: 'white'}}>
                 <thead><tr><th>Date</th><th>Capacity</th><th>Registered</th><th>Wait List</th></tr></thead>
                 <tbody>
                 {c.adminSchedule.map(o => 
                  <tr style={moment().add('day', -2).isBefore(o.when) ? undefined : {textDecoration:'line-through'}} key={o.id}>
                    <td>{moment(o.when).format("HHmm ddd MMM Do")}</td>
                    <td>{o.capacity}</td>
                    <td>{o.current}</td>
                    <td>{o.waiting}</td>
                    <td><Link to={`/admin/courses/${o.id}`}>Roster</Link></td>
                  </tr>
                 )}
                 </tbody>
                 </Table> : <div><i className='fa fa-spin fa-circle-o-notch'></i> Loading ...</div> }
                </ListGroupItemText>
              : undefined}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}

export default observer(CourseListPage);