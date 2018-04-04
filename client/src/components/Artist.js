import React, { Component } from 'react';

class Artist extends Component {

  componentDidMount() {
    console.log(this.props.artistId + ' hello');
  }

  render() {

    return (
      <div>
        <h1>{this.props.artistId}, Hello.</h1>
        <ul class="collection">
          <li class="collection-item">{this.props.artistId}</li>
        </ul>
      </div>
    );
  }
}

export default Artist;
