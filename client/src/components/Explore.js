import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Explore extends Component {

  state = {
    categories: [],
    bestArtists: []
  };

  componentDidMount() {

    // Fetch Artist information

    // fetch('localhost:3000/creator/' + this.props.artistId)
    //   .then(res => res.json())
    //   .then(artist => {
    //     this.setState({ artist });
    //   })

    var bestArtists = [
      {
      name: 'Hadag Nahash',
      id: 'dag',
      description: 'Israel #1 Hip Hop Band',
      profilePicture: 'http://www.yosmusic.com/wp-content/uploads/2016/02/%D7%94%D7%93%D7%92-%D7%A0%D7%97%D7%A9-%D7%A9%D7%95%D7%AA%D7%A4%D7%99%D7%9D-%D7%91%D7%A2%D7%9D-980x715.jpg'
      }, {
        name: 'Yoni Rehter',
        id: 'yonir',
        description: 'Jazz Master & Improve King',
        profilePicture: 'https://img.wcdn.co.il/f_auto,w_1000,t_18/8/3/9/2/839273-46.jpg'
      }, {
        name: 'Guy Mazig',
        id: 'guym',
        description: 'Guitarist, Singer-Song Writer',
        profilePicture: 'https://cdn.isnet.co.il/dyncontent/tmp/200/2018_3_7_3c36f11d-a8de-422c-beb9-4e8fe1199e76_510_1000_Fit_.jpg'
      }
    ];

    this.setState({ bestArtists });
  }

  render() {

    const { bestArtists } = this.state;

    return (
      <div className="section">
        <div className="container">
          <h3>Discover New Artists</h3>
          <div>
            {
             bestArtists.map((artist,i) => <Link key={i} to ={{ pathname: "/artist/"+artist.id }} ><img src={artist.profilePicture} /><p>{artist.description}</p></Link>)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Explore;
