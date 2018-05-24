const user_db_actions = require('../user_db_actions');
const creator_db_actions = require('../creator_db_actions');
const category_db_actions = require('../category_db_actions');
var nodemailer = require('nodemailer');
var passport = require('passport');
require('../config/passport')(passport); // pass passport for configuration

var cassandra = require('cassandra-driver');
//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'backstage_db' });

const routes = require('express').Router();

routes.get('/', (request, response) => {
  if (request.cookies.i18n !== undefined){
    response.setLocale(request.cookies.i18n);
  }
  response.render('layouts/main', {
      user : request.user, // get the user out of session and pass to template
      title: 'BackStage'
  })
})

// Users
/*routes.get('/checkout', function (req, res) {
  res.render('layouts/thankyou', { message: req.flash('thankYouMessage'), user : req.user, title: 'Thank You' });
});*/

routes.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));
// routes.post('/signin', function (req, res) {
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
routes.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile', // redirect to the secure profile section
  failureRedirect: '/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

routes.post('/update_user', function (req, res) {
  user_db_actions.UpdateUser(req, res, client);
});
routes.post('/delete_user', function (req, res) {
  user_db_actions.DeleteUser(req, res, client);
});
routes.get('/load_user', function (req, res) {
  user_db_actions.LoadUser(req, res, client);
});

routes.get('/creators', function (req, res) {
  var creators = JSON.parse('{"creators":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
  res.render('layouts/creators', {
      user: req.user, // get the user out of session and pass to template
      creators: creators,
      title: 'Creators'
  });
});

routes.get('/contact_us', function (req, res) {
  res.render('layouts/contact_us', {
    user: req.user, // get the user out of session and pass to template
    title: 'Contact Us'
  });
});

routes.post('/contact_us', function (req, res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
  });
  
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: 'myfriend@yahoo.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});

routes.get('/about_us', function (req, res) {
  res.render('layouts/about_us', {
    user: req.user, // get the user out of session and pass to template
    title: 'About Us'
  });
});

routes.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
  var categories_and_creators_ids = user_db_actions.LoadCategoriesAndCreators(req.user.email);
  var categories = category_db_actions.LoadCategories(categories_and_creators_ids[0]);
  var creators = creator_db_actions.LoadCreators(categories_and_creators_ids[1]);
  res.render('layouts/profile', {
      user: req.user, // get the user out of session and pass to template
      categories: categories,
      creators: creators,
      title: 'Profile'
  });
});

routes.post('/follow_creator', function (req, res) {
  user_db_actions.FollowCreator(req.user, req.body.creator_id);
});

routes.post('/unfollow_creator', function (req, res) {
  user_db_actions.UnFollowCreator(req.user, req.body.creator_id);
});

routes.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

routes.get('/messages', function (req, res) {
  var messages = user_db_actions.LoadMessages(req.user);
  res.render('layouts/messages', {
      user: req.user, // get the user out of session and pass to template
      messages: messages,
      title: 'Messages'
  });
});

routes.get('/categories', function (req, res) {
  var categories = JSON.parse('{"categories":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
  res.render('layouts/categories', {
      user: req.user, // get the user out of session and pass to template
      categories: categories,
      title: 'Categories'
  });
});

routes.get('/categories/:id', function (req, res) {
  // var data = category_db_actions.LoadCategory(client, req.params.id);
  var data = creator_db_actions.LoadCreators(client, req.params.id);
  res.render('layouts/category', {
      user : req.user, // get the user out of session and pass to template
      data: data,
      title: 'Category ' + data.name
  });
});

// Creators
routes.get('/creators/:id', function (req, res) {
  creator_db_actions.LoadCreator(client, req.params.id, function(error, result){
    if (error) {
      console.log(error);
    } else {
      console.log('Result: ' + result);
      res.render('layouts/creator', {
          user : req.user, // get the user out of session and pass to template
          data: JSON.parse(result),
          title: result.name
      });
    }
  });
});

routes.get('load_creator', function (req, res) {
  creator_db_actions.LoadCreator(req, res, client);
});
routes.post('insert_creator', function (req, res) {
  creator_db_actions.InsertCreator(req, res, client);
});
routes.post('update_creator', function (req, res) {
  creator_db_actions.UpdateCreator(req, res, client);
});
routes.post('delete_creator', function (req, res) {
  creator_db_actions.DeleteCreator(req, res, client);
});


module.exports = routes;