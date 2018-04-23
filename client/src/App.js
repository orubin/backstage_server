import React, { Component } from 'react';
import NavBar from './navbar/NavBar';
import Footer from './footer/Footer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './App.css';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
      <div>
        <NavBar />
        <p>BODY</p>
        <Footer />
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
