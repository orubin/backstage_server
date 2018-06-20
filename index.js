// index.js
const path = require('path');
const i18n = require('i18n');
const exphbs = require('express-handlebars');
const express = require('express');
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

i18n.configure({
    locales:['en', 'he'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    cookie: 'i18n'
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser()); // read cookies (needed for auth)

app.use(cookieParser("i18n_demo"));

app.use(session({
    secret: "i18n_demo",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(i18n.init);

var hbs = require('hbs');
hbs.registerHelper('__', function () {
    return i18n.__.apply(this, arguments);
});
hbs.registerHelper('__n', function () {
    return i18n.__n.apply(this, arguments);
});

// required for passport
app.use(session({ secret: 'backstagekey', resave: false, saveUninitialized: false })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/views/images')));
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

app.get('/he', function (req, res) {
    res.cookie('i18n', 'he');
    res.redirect('/')
});

app.get('/en', function (req, res) {
    res.cookie('i18n', 'en');
    res.redirect('/')
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

//owl-carousel
app.use('/modules', express.static(path.join(__dirname, 'node_modules')))
app.use('/css', express.static(path.join(__dirname, 'views/layouts/css')))