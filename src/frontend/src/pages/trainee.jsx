import React, { Component } from 'react'
import { connect } from 'react-redux'

import { List, ListItem, Subheader } from 'material-ui'

class TraineePage extends Component {
  componentWillMount() {
    const { doIt } = this.props;
    doIt();
  }

  render() {
    return (
      <div>
      <List>
        <Subheader>Personal Information</Subheader>
        <ListItem primaryText='Contact Information' secondaryText='Address, Email, Phone number' insetChildren={true} />
        <ListItem primaryText='Emergency Contacts' secondaryText='Who to call in an emergency' insetChildren={true} />
        <Subheader>Available Tasks</Subheader>      
        <Subheader>Blocked Tasks</Subheader>
        <Subheader>Completed Tasks</Subheader>
      </List>
      </div>
    );
  }
}

const storeToProps = (store) => {
  return {
    route: store.routing
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    doIt: () => dispatch({type: 'MY_ACTION'})
  }
}

export default connect(storeToProps, dispatchToProps)(TraineePage);