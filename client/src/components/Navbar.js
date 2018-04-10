import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

class Navbar extends Component {
  render() {
    return (
      <div className="navbar-fixed">
        <nav className="green">
          <div className="container">
            <div className="nav-wrapper">
              <a href="/" className="brand-logo">BackStage</a>
              <ul className="right hide-on-med-and-down">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/explore">Discover Creators</a>
                </li>
                <li>
                  <a href="/about-us">BackStage Story</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
