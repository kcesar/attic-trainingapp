import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge } from 'reactstrap'

import * as actions from '../actions'

import AuthRequired from '../components/auth-required'
import Authorization from '../components/authorization'

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
        {trainees.items.map(t => <ListGroupItem tag="a" href={config.localRoot + '/admin/trainees/' + t.member.id} action>{t.member.name}</ListGroupItem>)}
      </ListGroup>
     ) : <div>Loading ...</div>

    return <div className='container-fluid py-4'>
        <AuthRequired oidc={oidc}>
          <Authorization allowMember showDenied>
            <div>Trainee List</div>
            {list}
          </Authorization>
        </AuthRequired>
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