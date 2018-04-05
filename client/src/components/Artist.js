import React, { Component } from 'react';

class Artist extends Component {

  state = {
    artist: {}
  };

  componentDidMount() {
    // fetch('localhost:3000/creator/' + this.props.artistId)
    //   .then(res => res.json())
    //   .then(artist => {
    //     this.setState({ artist });
    //   })

    var tempArtist = {
      name: 'Hadag Nahash',
      id: this.props.artistId,
      description: 'Israel #1 Hip Hop Band'
    }
    this.setState({artist: tempArtist});
  }

  render() {

    const { artist } = this.state;
    return (
      <div>
        <h1>{artist.name}, Hello.</h1>
        <ul class="collection">
          <li class="collection-item">{artist.description}</li>
          <li class="collection-item">{artist.id}</li>
        </ul>
      </div>
    );
  }
}

export default Artist;
