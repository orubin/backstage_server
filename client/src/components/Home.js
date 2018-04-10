import React, { Component } from 'react'

class Home extends Component {
  render() {
    return (
      <div>
        <section className="slider">
          <ul className="slides">
            <li>
              <img src="https://source.unsplash.com/1600x900/?beach" />
              <div className="caption center-align">
                <h2>Engage your audience in a whole new way</h2>
                <h5 className="light grey-text text-lighten-3 hide-on-small-only">With BackStage, your fans are your sponsers, you just need to keep them happy</h5>
              </div>
            </li>
            <li>
              <img src="https://source.unsplash.com/1600x900/?travel" />
              <div className="caption left-align">
                <h2>Get personal contact with your followrs and grow your community</h2>
                <h5 className="light grey-text text-lighten-3 hide-on-small-only">Lead your fans to a One-Stop-Shop to get updates and support your creations</h5>
              </div>
            </li>
            <li>
              <img src="https://source.unsplash.com/1600x900/?cruise" />
              <div className="caption right-align">
                <h2>Keep your funds & your independent</h2>
                <h5 className="light grey-text text-lighten-3 hide-on-small-only">All your work stays with you, we don't own anything you upload</h5>
              </div>
            </li>
          </ul>
        </section>

        <div className="section">
          <div className="container">
            <br /><br />
            <h1 className="header center teal-text text-lighten-2">BackStage</h1>
            <div className="row center">
              <h5 className="header col s12 light">Recruit your best fans to join your career</h5>
            </div>
            <div className="row center">
              <a href="/about-us" id="download-button" className="btn-large waves-effect waves-light teal lighten-1">Get Started</a>
            </div>
            <br /><br />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
