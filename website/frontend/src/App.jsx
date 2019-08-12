import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from 'reactstrap';
import { connect } from 'react-redux'
import { Route, Link } from 'react-router-dom';
import { GatewayProvider, GatewayDest } from 'react-gateway'

import store from './store'
import * as actions from './actions'

import LoggedInPage from './pages/logged-in'
import HomePage from './pages/home'
import TraineePage from './pages/trainee'
import TraineesPage from './pages/trainees'
import AdminHomePage from './pages/admin-home'
import CoursesPage from './pages/course-list'
import CourseRoster from './pages/course-roster'
import RegistrationPage from './pages/registration'
import './App.css'

const watchMemberId = props => {
  const { member, oidc } = store.getState()
  //console.log('watchMemberId', props.match, oidc, member)
  const memberId = ((props.match || {}).params || {}).memberId || (((oidc||{}).user||{}).profile||{}).memberId
  if (memberId !== (member||{}).id) {
    store.dispatch({type: actions.SET_MEMBER, payload: { id: memberId } })
  }
  return null
}
store.subscribe(() => {
  watchMemberId({match: { params: { memberId: store.getState().member.id }}})
})

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
      <GatewayProvider>
        <div>
          <Navbar color='dark' dark expand="md">
            <NavbarToggler onClick={this.toggle} />
            <Link to='/' className='navbar-brand'>King County ESAR<span className='hidden-xs-down'> - Basic Training</span></Link>
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className='ml-auto' navbar>
                <NavItem><button className='nav-link' onClick={this.toggleAuth}>Sign {user && user.token_type ? 'out' : 'in'}</button></NavItem>
              </Nav>
            </Collapse>
          </Navbar>
          <Route exact path='/loggedIn' component={LoggedInPage} />
          <Route exact path='/' component={HomePage} />
          <Route path='/me' render={watchMemberId} />
          <Route exact path='/me' component={TraineePage} />
          <Route exact path='/admin' component={AdminHomePage} />
          <Route path='/admin/trainees/:memberId' render={watchMemberId} />
          <Route exact path='/admin/trainees' component={TraineesPage} />
          <Route exact path='/admin/trainees/:memberId' component={TraineePage} />
          <Route exact path='/courses' component={CoursesPage} />
          <Route exact path='/admin/courses' component={CoursesPage} />
          {/* <Route exact path='/admin/courses/:courseId(\\d+)' component={CourseRoster} /> */}
          <Route exact path='/admin/courses/:courseId' component={CourseRoster} />
          <Route exact path='/admin/register' component={RegistrationPage} />
          <div className='container py-4'>
            <div className='row justify-content-center'>
              <div style={{ margin: '0 auto', textAlign: 'center', padding: '5px', fontSize: '90%' }}>© 2019 - This project is open source. View it on <a href="https://github.com/kcesar/esar-training">GitHub</a></div>
            </div>
          </div>
          <GatewayDest name="root" />
        </div>
      </GatewayProvider>
    );
  }
}

const storeToProps = (store) => {
  return {
    user: store.oidc.user,
    config: store.config
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    doSignin: () => dispatch(actions.doSignin()),
    doSignout: () => dispatch(actions.doSignout())
  }
}

export default connect(storeToProps, dispatchToProps)(App)