import React, { Component } from 'react';

class Navbar extends Component {
  render() {
    return (
      <header>
        <nav className="teal lighten-3">
          <div className="nav-wrapper">
            <a href="/" className="brand-logo">BS</a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li><a href="/explore">Explore Artists</a></li>
            </ul>
          </div>
        </nav>
      </header>
    );
  }
}

export default Navbar;
