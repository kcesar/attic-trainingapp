import 'babel-polyfill/dist/polyfill.js'
import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'


import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store, { history } from './store'

import HomePage from './pages/homepage'

const router = (
  <ConnectedRouter history={history}>
    <div>
      <Route path="/" component={App} />
      <Route exact path="/" component={HomePage}/>
    </div>
  </ConnectedRouter>
)

ReactDOM.render(
    <Provider store={store}>
    {router}
    </Provider>
 , document.getElementById('root'));
registerServiceWorker();
