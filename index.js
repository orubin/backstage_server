// index.js
const path = require('path')
const exphbs = require('express-handlebars')
const db_actions = require('./db_actions');
var cassandra = require('cassandra-driver');
const express = require('express')
const app = express()
const port = 3000

//Connect to the cluster
var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'backstage_db'});

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
    response.render('layouts/home', {
      name: 'Backstage Server'
    })
  })

app.post('/user', function (req, res) {
	if(typeof(req.body.UserEdit) != "undefined"){
		db_actions.UpdateUser(req, res, client);
	} else {
		db_actions.InsertUser(req, res, client);
	}
});

app.post('/delete_user', function (req, res) {	
	db_actions.DeleteUser(req, res, client);
});

app.get('/load_user', function (req, res) {
	db_actions.LoadUser(req, res, client);
});
  
app.listen(process.env.PORT || 5000, (err) => {
    if (err) {
        return console.log('Something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})