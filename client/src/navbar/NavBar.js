import React, { Component } from 'react'
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';


export default class NavBar extends Component {
    render() {
        return (
            <div>
                <AppBar>
                    <TextField
                        name="search"
                    />
                </AppBar>
            </div>
        );
    }
}
