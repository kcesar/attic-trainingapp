import 'babel-polyfill/dist/polyfill.js'
import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store, { history } from './store'

import HomePage from './pages/home'
import TraineePage from './pages/trainee'

injectTapEventPlugin()

const router = (
  <ConnectedRouter history={history}>
    <div>
      <Route path="/" component={App} />
      <Route exact path="/" component={HomePage}/>
      <Route exact path="/me" component={TraineePage} />
    </div>
  </ConnectedRouter>
)

ReactDOM.render(
  <MuiThemeProvider>
    <Provider store={store}>
    {router}
    </Provider>
  </MuiThemeProvider>
 , document.getElementById('root'));
registerServiceWorker();
