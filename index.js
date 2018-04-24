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
var passport = require('passport');
require('./config/passport')(passport); // pass passport for configuration
var cookieParser = require('cookie-parser');
var session = require('express-session');
// const checkAuth = require('check-auth');
var morgan = require('morgan');
var flash    = require('connect-flash');

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
app.use(cookieParser()); // read cookies (needed for auth)
// required for passport
app.use(session({ secret: 'backstagekey', resave: false, saveUninitialized: false })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash()); // use connect-flash for flash messages stored in session

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
        user : request.user // get the user out of session and pass to template
    })
})

// Users
app.get('/login', function (req, res) {
    res.render('layouts/signup', { message: req.flash('signupMessage') });
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login#sectionB', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
// app.post('/signin', function (req, res) {
//     var data = user_db_actions.LoadUser(client, req.body.email);
//     if(data){
//         bcrypt.compare(req.body.password, data.password, (err, result) => {
//             if(err) {
//                 return res.status(401).json({
//                     message: 'Auth failed'
//                 })
//             }
//             if(result){
//                 const token = jwt.sign({
//                     email: req.body.email,
//                     userId: data.id
//                 }, 'SECRETKEY', {expiresIn: "1h"});
//                 return res.status(200).json({
//                      message: 'Auth succesfull',
//                      token: token
//                 });
//             }
//         });
//     } else {
//         res.status(401).json({
//             message: 'Auth failed'
//         })
//     }
// });

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.post('/delete_user', function (req, res) {
    user_db_actions.DeleteUser(req, res, client);
});
app.get('/load_user', function (req, res) {
    user_db_actions.LoadUser(req, res, client);
});

app.get('/creators', function (req, res) {
    var creators = JSON.parse('{"creators":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
    res.render('layouts/creators', {
        user : req.user, // get the user out of session and pass to template
        creators: creators
    });
});
app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
    res.render('layouts/profile', {
        user : req.user // get the user out of session and pass to template
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/messages', function (req, res) {
    res.render('layouts/messages', {
        user : req.user // get the user out of session and pass to template
    });
});
app.get('/categories', function (req, res) {
    var categories = JSON.parse('{"categories":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
    res.render('layouts/categories', {
        user : req.user, // get the user out of session and pass to template
        categories: categories
    });
});
app.get('/category/:id', function (req, res) {
    // var data = category_db_actions.LoadCategory(client, req.params.id);
    var data = creator_db_actions.LoadCreators(client, req.params.id);
    res.render('layouts/category', {
        user : req.user, // get the user out of session and pass to template
        data: data
    });
});

// Creators
app.get('/creators/:id', function (req, res) {
    var data = creator_db_actions.LoadCreator(client, req.params.id);
    res.render('layouts/creator', {
        user : req.user, // get the user out of session and pass to template
        data: JSON.parse(data)
    });
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