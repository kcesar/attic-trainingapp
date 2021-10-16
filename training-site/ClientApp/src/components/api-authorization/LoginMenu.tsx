import React, { Component, Fragment } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import authService from './AuthorizeService';
import { ApplicationPaths } from './ApiAuthorizationConstants';
import { observer } from 'mobx-react';
import { SiteConfig } from '../../models/siteConfig';

interface LoginMenuState {
  isAuthenticated: boolean;
  userName: string | null;
}

export class LoginMenu extends Component<{ config: SiteConfig }, LoginMenuState> {
  private _subscription?: number;

  constructor(props: { config: SiteConfig }) {
    super(props);

    this.state = {
      isAuthenticated: false,
      userName: null
    };
  }

  componentDidMount() {
    this._subscription = authService.subscribe(() => this.populateState());
    this.populateState();
  }

  componentWillUnmount() {
    authService.unsubscribe(this._subscription);
  }

  async populateState() {
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
    this.setState({
      isAuthenticated,
      userName: user && user.name
    });
  }

  render() {
    const { isAuthenticated, userName } = this.state;
    if (!isAuthenticated) {
      const registerPath = `${ApplicationPaths.Register}`;
      const loginPath = `${ApplicationPaths.Login}`;
      return this.anonymousView(registerPath, loginPath);
    } else {
      const profilePath = `${ApplicationPaths.Profile}`;
      const logoutPath = { pathname: `${ApplicationPaths.LogOut}`, state: { local: true } };
      return this.authenticatedView(userName, profilePath, logoutPath);
    }
  }

  authenticatedView(userName: any, profilePath: any, logoutPath: any) {
    return (<>
      <NavItem>
        <NavLink tag={Link} className="text-dark" disabled to={profilePath}>{userName}</NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={Link} className="text-dark" to={logoutPath}>Logout</NavLink>
      </NavItem>
    </>);
  }

  anonymousView(registerPath: any, loginPath: any) {
    return (<>
      {!this.props.config.canRegister ? undefined :
        <NavItem>
          <NavLink tag={Link} className="text-dark" to={registerPath}>Register</NavLink>
        </NavItem>
      }
      <NavItem>
        <NavLink tag={Link} className="text-dark" to={loginPath}>Login</NavLink>
      </NavItem>
    </>);
  }
}

export default observer(LoginMenu);