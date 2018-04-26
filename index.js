// index.js
const path = require('path')
const exphbs = require('express-handlebars')
const express = require('express')
var hbs = require('hbs');
var fs = require('fs');
var bodyParser = require('body-parser');
const app = express();
const jwt = require ('jsonwebtoken');
var passport = require('passport');
require('./config/passport')(passport); // pass passport for configuration
var cookieParser = require('cookie-parser');
var session = require('express-session');
// const checkAuth = require('check-auth');
var morgan = require('morgan');
var flash    = require('connect-flash');
const routes = require('./routes');
const port = 3001

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

app.use(express.static(path.join(__dirname, '/views/layouts/css')));
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

//  Connect all our routes to our application
app.use('/', routes);

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})