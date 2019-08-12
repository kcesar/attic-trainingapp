import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from 'reactstrap'

import AuthRoute from '../components/auth/AuthRoute'
import * as actions from '../actions'

class TraineesPage extends Component {
  componentDidMount() {
    if ((this.props.oidc.user||{}).access_token) this.props.getTraineesData()
  }

  componentDidUpdate(prevProps) {
    if ((this.props.oidc.user||{}.access_token) && !(prevProps.oidc.user||{}).access_token) this.props.getTraineesData()
  }

  render() {
    const { oidc, trainees, config } = this.props
    
    const list = trainees.loaded
     ? (
      <ListGroup>
        {trainees.items.map(t => <ListGroupItem key={t.id} tag={Link} to={config.apis.training.url + '/admin/trainees/' + t.member.id} action>{t.member.name}</ListGroupItem>)}
      </ListGroup>
     ) : <div>Loading ...</div>

    return <div className='container-fluid py-4'>
      <AuthRoute oidc={oidc} roles='cdb.users'>
        <Link to="/admin">&lt; Admin Home</Link>
        <div>Trainee List</div>
        {list}
      </AuthRoute>
    </div>
  }
}


const storeToProps = (store) => {
  return {
    config: store.config,
    oidc: store.oidc,
    trainees: store.trainees
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getTraineesData: () => dispatch(actions.getTraineesData()),
  }
}

export default connect(storeToProps, dispatchToProps)(TraineesPage);