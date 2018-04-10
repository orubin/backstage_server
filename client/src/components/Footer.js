import React, { Component } from 'react'

class Footer extends Component {
  render() {
    return (
      <footer className="page-footer teal lighten-1">
        <div className="container">
          <div className="row">
            <div className="col l4 s12">
              <ul>
                <li><a className="grey-text text-lighten-3" href="/">Home</a></li>
                <li><a className="grey-text text-lighten-3" href="/explore">Explore</a></li>
                <li><a className="grey-text text-lighten-3" href="/about-us">Learn about BackStage</a></li>
              </ul>
            </div>
            <div className="col l6 offset-l2 s12">
              <h5 className="white-text">BackStage Footer</h5>
              <p className="grey-text text-lighten-4">BackStage is a new Crowdfund platform with a new funding model. Instead of giving money to a project you don’t even remember what perk you paid for, you contribute monthly to an artist you like, helping him continue his work, uninterrupted by financial worries.</p>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="container">
          © 2018 BackStage, MBI.
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
