import React, { Component } from 'react'
import { connect } from 'react-redux'

class HomePage extends Component {
  componentWillMount() {
    const { doIt } = this.props;
    doIt();
  }

  render() {
    return (
      <div>
        Home Page
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

export default connect(storeToProps, dispatchToProps)(HomePage);