import React from 'react'
import { Route, Switch } from 'react-router-dom'

// Import Components
import Artist from './Artist'
import Home from './Home'
import Explore from './Explore'
import NotFound from './NotFound'

const Main = () => (
  <div>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/artist/:id"
        render={(props) => <Artist artistId={props.match.params.id} {...props} /> }
      />
      <Route path="/explore" component={Explore} />
      <Route component={NotFound} />
    </Switch>
  </div>
)

export default Main;
