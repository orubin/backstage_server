// index.js
const path = require('path')
const exphbs = require('express-handlebars')
const user_db_actions = require('./user_db_actions');
const creator_db_actions = require('./creator_db_actions');
var cassandra = require('cassandra-driver');
const express = require('express')
const app = express()
const port = 3001

//Connect to the cluster
var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'backstage_db'});

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.use(express.json());

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
    response.render('layouts/home', {
      name: 'Backstage Server'
    })
  })

// Users
app.post('/user', function (req, res) {
	if(typeof(req.body.UserEdit) != "undefined"){
		user_db_actions.UpdateUser(req, res, client);
	} else {
		user_db_actions.InsertUser(req, res, client);
	}
});
app.post('/delete_user', function (req, res) {	
	user_db_actions.DeleteUser(req, res, client);
});
app.get('/load_user', function (req, res) {
	user_db_actions.LoadUser(req, res, client);
});

// Creators
app.get('load_creator', function (req, res) {
    creator_db_actions.LoadCreator(req, res, client);
});
app.post('insert_creator', function (req, res) {
    creator_db_actions.InsertCreator(req, res, client);
});
app.post('update_creator', function (req, res) {
    creator_db_actions.UpdateCreator(req, res, client);
});
app.post('delete_creator', function (req, res) {
    creator_db_actions.DeleteCreator(req, res, client);
});
  
app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})