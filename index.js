// index.js
const path = require('path')
const exphbs = require('express-handlebars')
const user_db_actions = require('./user_db_actions');
const creator_db_actions = require('./creator_db_actions');
var cassandra = require('cassandra-driver');
const express = require('express')
var hbs = require('hbs');
var fs = require('fs');
var bodyParser = require('body-parser');
const app = express();
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const port = 3001

//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'backstage_db' });

app.engine('.hbs', exphbs({
    //   defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: [
        __dirname + '/views/layouts/partials',
    ]
}))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

var partialsDir = __dirname + '/views/layouts/partials';

var filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    var name = matches[1];
    var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    hbs.registerPartial(name, template);
});

app.get('/', (request, response) => {
    response.render('layouts/main', {
        name: 'Backstage Server'
    })
})

// Users
app.get('/sign', function (req, res) {
    res.render('layouts/signup', {});
});

app.post('/signup', function (req, res) {
    var data = user_db_actions.InsertUser(client, req.body.email, req.body.password);
});
app.post('/signin', function (req, res) {
    var data = user_db_actions.LoadUser(client, req.body.email);
    if(data){
        bcrypt.compare(req.body.password, data.password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            if(result){
                const token = jwt.sign({
                    email: req.body.email,
                    userId: data.id
                }, 'SECRETKEY', {expiresIn: "1h"});
                return res.status(200).json({
                     message: 'Auth succesfull',
                     token: token
                });
            }
        });
    } else {
        res.status(401).json({
            message: 'Auth failed'
        })
    }
});

app.post('/user', function (req, res) {
    if (typeof (req.body.UserEdit) != "undefined") {
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

app.get('/creators', function (req, res) {
    var creators = JSON.parse('{"creators":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
    res.render('layouts/creators', creators);
});
app.get('/profile', function (req, res) {
    res.render('layouts/profile');
});
app.get('/messages', function (req, res) {
    res.render('layouts/messages');
});
app.get('/categories', function (req, res) {
    var categories = JSON.parse('{"categories":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
    res.render('layouts/categories', categories);
});
app.get('/category/:id', function (req, res) {
    // var data = category_db_actions.LoadCategory(client, req.params.id);
    var data = creator_db_actions.LoadCreators(client, req.params.id);
    res.render('layouts/category', data);
});

// Creators
app.get('/creators/:id', function (req, res) {
    var data = creator_db_actions.LoadCreator(client, req.params.id);
    res.render('layouts/creator', JSON.parse(data));
});
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