import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import AuthorizeRoute from './components/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './components/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './components/api-authorization/ApiAuthorizationConstants';

import './App.css'

import Home from './pages/HomePage';
import Trainee from './pages/TraineePage';
import { TrainingStore } from './store';
import { observer } from 'mobx-react';
import { Alert } from 'reactstrap';

const InnerApp :React.FC<{store: TrainingStore}> = ({store}) => (
  <Layout config={store.config}>
    <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
    {store.tokenExpired
      ? <Alert color="warning">Session Expired. <a href={`${ApplicationPaths.Login}?returnUrl=${encodeURIComponent(window.location.href)}`} className="alert-link">Login again</a></Alert>
      : <>
        <Route exact path='/' component={Home} />
        <AuthorizeRoute exact path='/me' component={() => <Trainee store={store} />} />
        <AuthorizeRoute exact path="/trainee/:id" component={() => <Trainee store={store} />} />
        <Route path='/counter' component={Counter} />
        <AuthorizeRoute path='/fetch-data' component={FetchData} />
      </>
    }
  </Layout>
)

const ObservableApp = observer(InnerApp);

export default class App extends Component<{store: TrainingStore}> {
  static displayName = App.name;

  render () {
    return (<ObservableApp store={this.props.store} />);
  }
}
