import React, {Component, Fragment} from "react";
import { Route } from "react-router-dom";
//import PropTypes from "prop-types";
import { connect } from "react-redux";
import userManager from '../../user-manager';

class ForceLogin extends Component {
  constructor(props) {
    super(props)
    this.redirect = props.redirect;
  }

  componentDidMount() {
    sessionStorage.setItem('redirect', this.redirect);
    userManager.signinRedirect();
  }

  render() {
    return 'Redirecting to login page ...';
  }
}

export const AuthRoute = React.memo((
  { component: Component, children, denied, loading, oidc, roles, self, ...rest }) => {
  // assume denied
  var content = props => <Fragment>{denied || (denied === '' ? denied : <ForceLogin redirect={props.match.url} />)}</Fragment>;

  if ((oidc.isLoadingUser && !oidc.preload) || oidc.isSigningOut || (roles && (oidc.loadingGroups || (oidc.user && !oidc.groups)))) {
    content = () => <Fragment>{loading || (loading === '' ? loading : <i className='fas fa-spinner fa-spin'></i>)}</Fragment>;
  } else if (oidc.user) {
    const simpleCheck = !self && !roles;
    const selfCheck = simpleCheck || self === oidc.user.profile.memberId;
    const rolesCheckA = simpleCheck || (oidc.groups && oidc.groups.includes(roles))
    const rolesCheck = rolesCheckA || (roles && oidc.groups && Array.isArray(roles) && oidc.groups.some(r => roles.includes(r)));

    if (simpleCheck || selfCheck || rolesCheck) {
      content = () => Component ? <Component {...rest} /> : <Fragment>{children}</Fragment>
    }
  }

  return (<Route {...rest} render={content} />);
});

// AuthRoute.propTypes = {
//   denied: PropTypes.node,
//   component: PropTypes.func.isRequired,
//   oidc: PropTypes.object.isRequired,
//   roles: PropTypes.object
// };

function mapStateToProps(state) {
  return {
    oidc: state.oidc
  };
}

export default connect(mapStateToProps)(AuthRoute);