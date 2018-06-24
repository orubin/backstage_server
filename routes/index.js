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

routes.get('/thankyou', (request, response) => {
  if (request.cookies.i18n !== undefined){
    response.setLocale(request.cookies.i18n);
  }
  response.render('layouts/thankyou', {
      user : request.user, // get the user out of session and pass to template
      title: 'Thank You'
  })
})

routes.get('/explore', (request, response) => {
  creator_db_actions.LoadCreators(client, function(error, result){
    if (request.cookies.i18n !== undefined){
      response.setLocale(request.cookies.i18n);
    }
    console.log(request.user);
    response.render('layouts/explore', {
      user : request.user, // get the user out of session and pass to template
      creators : JSON.parse(result),
      helpers: {
        renderPage: function(data) {
          var returnArrayTest =[];
          for(var m = 0; m<data.length; m+=9) {
            var pageArray = data.slice(m,m+9);
            returnArrayTest.push([]);
            for (var i=0; i<pageArray.length; i+=3) {
                var temparray = pageArray.slice(i,i+3);
                returnArrayTest[m/9].push(temparray);
            }
          }
          return returnArrayTest;
        },
        setAsActivePage: function(i) {
          if(i==0){
            return "class='page active_page'";
          } else {
            return "class='page'";
          }
        },
        calcNumPages: function(data) {
          var htmlStr = '';
          for(var i=0;i<data.length/9;i++) {
            htmlStr+="<li class='waves-effect page_button'"+( 'id='+('page_button'+i))+" onClick='thisPage(this)'><a>"+(i+1)+"</a></li>";
          }
          return htmlStr;
        }
      },
      title: 'BackStage'
    })
  });
})

// Users
/*routes.get('/checkout', function (req, res) {
  res.render('layouts/thankyou', { message: req.flash('thankYouMessage'), user : req.user, title: 'Thank You' });
});*/

routes.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/loginfail', // redirect back to the signup page if there is an error
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
  successRedirect: '/', // redirect to the secure profile section
  failureRedirect: '/loginfail', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));
routes.get('/loginfail', function(req, res) {
  var theMsg = req.flash('signupMessage');
  res.render('layouts/main', {
    user: req.user, // get the user out of session and pass to template
    title: 'BackStage',
    msg: theMsg
  });
});

routes.get('/test', function(req, res) {
  creator_db_actions.LoadCreatorsWithCategory(client, req.query.categories[0], function(error, result){
    res.render('layouts/explore', {
      user : req.user, // get the user out of session and pass to template
      creators : JSON.parse(result),
      helpers: {
        renderPage: function(data) {
          var returnArrayTest =[];
          for(var m = 0; m<data.length; m+=9) {
            var pageArray = data.slice(m,m+9);
            returnArrayTest.push([]);
            for (var i=0; i<pageArray.length; i+=3) {
                var temparray = pageArray.slice(i,i+3);
                returnArrayTest[m/9].push(temparray);
            }
          }
          return returnArrayTest;
        },
        setAsActivePage: function(i) {
          if(i==0){
            return "class='page active_page'";
          } else {
            return "class='page'";
          }
        },
        calcNumPages: function(data) {
          var htmlStr = '';
          for(var i=0;i<data.length/9;i++) {
            htmlStr+="<li class='waves-effect page_button'"+( 'id='+('page_button'+i))+" onClick='thisPage(this)'><a>"+(i+1)+"</a></li>";
          }
          return htmlStr;
        }
      },
      title: 'BackStage'
    });
  });
});

routes.post('/update_user', function (req, res) {
  user_db_actions.UpdateUser(req, res, client);
});
routes.post('/delete_user', function (req, res) {
  user_db_actions.DeleteUser(req, res, client);
});
routes.get('/load_user', function (req, res) {
  user_db_actions.LoadUser(req, res, client);
});
routes.get('/payment_completed', function (req, res) {
  user_db_actions.ClaimReward(req, res, client);
  res.render('layouts/payment_completed', {
    user: req.user, // get the user out of session and pass to template
    title: 'Payment Completed'
  });
});

routes.get('/creators', function (req, res) {
  //var creators = JSON.parse('{"creators":[{"id":"1", "name":"one","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"two","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"three","description":"desc3","img_src":"img_src_3"}]}');
  creator_db_actions.LoadCreators(client, function(error, result){
    var data = {};
    data['creators'] = JSON.parse(result);
    res.render('layouts/creators', {
        user: req.user, // get the user out of session and pass to template
        creators: data,
        title: 'Creators'
    });
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
  var creators = creator_db_actions.LoadCreatorsWithCategories(client, categories_and_creators_ids[1]);
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

routes.get('/insertdata', function(req, res) {
  creator_db_actions.InsertContent(client);
  res.redirect('/');
});

routes.get('/categories', function (req, res) {
  var categories = JSON.parse('{"categories":[{"id":"1", "name":"Rock","description":"desc1","img_src":"img_src_1"},{"id":"2", "name":"Jazz","description":"desc2","img_src":"img_src_2"},{"id":"3", "name":"Rap","description":"desc3","img_src":"img_src_3"}]}');
  res.render('layouts/categories', {
      user: req.user, // get the user out of session and pass to template
      categories: categories,
      title: 'Categories'
  });
});

routes.get('/categories/:id', function (req, res) {
  creator_db_actions.LoadCreatorsWithCategory(client, req.params.id, function(error, result){
    if (error) {
      console.log(error);
    } else {
      console.log('Result: ' + result);
      res.render('layouts/category', {
        user : req.user, // get the user out of session and pass to template
        data: JSON.parse(result),
        title: 'Category '
      });
    }
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