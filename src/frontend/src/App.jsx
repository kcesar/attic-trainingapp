import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { connect } from 'react-redux'

import * as actions from './actions'

class App extends Component {
  state = {
    isOpen: false
  }

  toggleAuth = () => {
    const { user, doSignin, doSignout } = this.props
    if (user && user.token_type) {
      doSignout()
    } else {
      doSignin()
    }
  }

  toggle = () => {
    this.setState({isOpen: !this.state.isOpen})
  }

  render() {
    const { user } = this.props

    return (
      <div>
        <Navbar color='primary' toggleable inverse>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href='/'>King County ESAR<span className='hidden-xs-down'> - Basic Training</span></NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='ml-auto' navbar><NavItem><button className='nav-link' onClick={this.toggleAuth}>Sign {user && user.token_type ? 'out' : 'in'}</button></NavItem></Nav>
          </Collapse>
         {/* <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/components/">Components</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
          */}
        </Navbar>
      </div>
    );
  }
}

const storeToProps = (store) => {
  return {
    user: store.oidc.user
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    doSignin: () => dispatch(actions.doSignin()),
    doSignout: () => dispatch(actions.doSignout())
  }
}

export default connect(storeToProps, dispatchToProps)(App);