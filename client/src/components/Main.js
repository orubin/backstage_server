import React from 'react';
import { Route, Switch } from 'react-router-dom'

// Import Components
import Artist from './Artist';
import Home from './Home';
import Explore from './Explore';

const Main = () => (
  <div>
    <main>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/artist/:id"
          render={(props) => <Artist artistId={props.match.params.id} {...props} /> }
        />
        <Route path="/explore" component={Explore} />
      </Switch>
    </main>
  </div>
)

export default Main;
