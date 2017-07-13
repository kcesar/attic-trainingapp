import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar'

import './App.css';

class App extends Component {
  render() {
    return (
      <AppBar title="King County ESAR" showMenuIconButton={false} />
    );
  }
}

export default App;
