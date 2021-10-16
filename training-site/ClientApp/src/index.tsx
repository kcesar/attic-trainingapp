import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.css';
import { TrainingStore } from './store';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') ?? undefined;

const store = new TrainingStore();

ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
      <App store={store} />
    </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
