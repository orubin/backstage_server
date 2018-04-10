import React, { Component } from 'react'
import Reward from './Reward'

class Artist extends Component {

  state = {
    artist: {}
  };

  componentDidMount() {

    //Fetch Artist information
    fetch('http://ec2-18-217-204-191.us-east-2.compute.amazonaws.com/sample_creator')
      .then(res => res.json())
      .then(artist => {
        this.setState({ artist });
      })

    // var tempArtist = {
    //   name: 'Hadag Nahash',
    //   id: this.props.artistId,
    //   description: 'Israel #1 Hip Hop Band'
    // }
    // this.setState({artist: tempArtist});
  }

  render() {
    const { artist } = this.state;

    let youtubeURL = 'https://www.youtube.com/embed/' + artist.youtube + '?rel=0';

    return (
      <div className="section">
        <div className="container">
          <br /><br />
          <h1 className="header center teal-text text-lighten-2">Hello {artist.name}</h1>
          <div className="row center">
            <h5 className="header col s12 light">Recruit your best fans to join your career</h5>
            <p>Email: {artist.email}</p>
          </div>
          <div className="video-container">
            <iframe width="600" height="360" src={youtubeURL} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
          <div className="row">

          </div>
          <br /><br />
        </div>
      </div>
    );
  }
}

export default Artist;
