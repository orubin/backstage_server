import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => (
    <div id="404">
      <h2>Oops! this isn't where you parked your car</h2>
      <Link to="/">Go Back</Link>
    </div>
)
export default NotFound;
