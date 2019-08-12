import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import userManager from "../../user-manager";
import PropTypes from "prop-types";

class LoginCallback extends Component {
  render() {
    return (
      <CallbackComponent
        userManager={userManager}
        successCallback={() => {
          if (sessionStorage.redirect) {
            var redirect = sessionStorage.redirect;
            sessionStorage.removeItem('redirect');
            this.props.history.push(redirect);
          } else {
            window.location.href = '/';
          }
        }}
        errorCallback={error => {
          console.error(error);
          if (sessionStorage.redirect) {
            this.props.history.push(sessionStorage.redirect);
          } else {
            window.location.href = '/';
          }
        }}
      >
        <div><i className='fas fa-spin fa-spinner'></i> Finishing login</div>
      </CallbackComponent>
    );
  }
}

LoginCallback.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default withRouter(connect()(LoginCallback));
