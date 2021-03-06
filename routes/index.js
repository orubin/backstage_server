const user_db_actions = require('../user_db_actions');
const creator_db_actions = require('../creator_db_actions');
const category_db_actions = require('../category_db_actions');
var nodemailer = require('nodemailer');
var passport = require('passport');
const paypal = require('../lib/paypal_checkout');
require('../config/passport')(passport); // pass passport for configuration

var cassandra = require('cassandra-driver');
// Connect to the cluster
var client = new cassandra.Client({ contactPoints: [process.env.DB_HOST], keyspace: 'backstage_db' });

const routes = require('express').Router();

routes.get('/', (request, response) => {
  if (request.user == undefined) {
    if (request.cookies.i18n !== undefined){
      response.setLocale(request.cookies.i18n);
    }
    creator_db_actions.models.instance.Creator.find({}, function(err, result){
      if(err) {
        console.log('Error: ' + err);
      }
      else{
        response.render('layouts/main', {
          user : request.user,
          creators: result,
          title: 'BackStage'
        })
      }
    });
    
  } else {
    user_db_actions.GetRewards(request.user.email, function(error, result){
      var rewards = result.rows;
      if (request.cookies.i18n !== undefined){
        response.setLocale(request.cookies.i18n);
      }
      response.render('layouts/main', {
          user : request.user, // get the user out of session and pass to template
          title: 'BackStage',
          rewards: result.rows,
          helpers: {
            getFirstName: function(name) {
              return name.split(' ')[0];
            },
            getLastName: function(name) {
              var fullName = name.split(' ');
              return fullName[fullName.length-1];
            }
          }
      })
    });
  }
})



routes.post('/pay_with_paypal', (request, response) => {
  paypal.PayWithPaypal(request.body.amount, request.body.title, function(error, url){
    if(error) { console.log("Error in paypal.PayWithPaypal:" + error); }
    else{
      request.session.desc = request.body.title;
      request.session.amount = request.body.amount;
      request.session.reward_id = request.body.reward_id;
      request.session.creator_username = request.body.creator_username;
      response.redirect(url);
    }
  });
  //response.render('/');
})

routes.get('/purchase/success', (request, response) => {
  var url = require('url');
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  paypal.CreateSubscription(request.session.amount, request.session.desc, query.token, query.PayerID, function(error, result){
    if (error) { console.log("ERRRR: " + error); }
    else { 
      creator_db_actions.models.instance.Creator.findOne({username: request.session.creator_username}, function(err, result2){
				if(err) {
					console.log('Error: ' + err);
				}
        else{
          user_db_actions.ClaimReward(request.user.email, request.session.reward_id, 
            request.session.creator_username, request.session.amount, result.PROFILEID, result2.category_id);
          response.render('layouts/thankyou', {
                          user: request.user,
                          data: result2,
                          pkg_name: request.session.desc,
                          amount: request.session.amount,
                          title: 'Thank You'
          });
        }
			});
    }
  });
})

routes.get('/purchase/fail', (request, response) => {
  response.redirect('/');
})

routes.get('/thankyou', (request, response) => {
  if (request.cookies.i18n !== undefined){
    response.setLocale(request.cookies.i18n);
  }
  creator_db_actions.models.instance.Creator.findOne({username: 'moshbenari'}, function(err, result){
    response.render('layouts/thankyou', {
        user : request.user,
        data: result,
        title: 'Thank You'
    });
  });
})

routes.get('/explore', (request, response) => {
  creator_db_actions.LoadCreators(client, function(error, result){
    if (request.cookies.i18n !== undefined){
      response.setLocale(request.cookies.i18n);
    }
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
        },
        getNumberCreators: function(id, arr) {
          var sum =0;
          for(var i=0; i<arr.length; i++) {
            if(arr[i].category_id==id) {
              sum+=1;
            }
          }
          return sum;
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
  failureRedirect: '/loginfail', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}), (req, res) => {
  res.redirect(req.headers.referer);
});

routes.get('/loginfail', function(req, res) {
  var theMsg = req.flash('signupMessage');
  res.render('layouts/main', {
    user: req.user, // get the user out of session and pass to template
    title: 'BackStage',
    msg: theMsg
  });
});

routes.get('/getCreatorsWithCategories', function(req, res) {
  creator_db_actions.LoadCreatorsWithCategories(client, req.query.categories, function(error, result){
    res.json(result);
  });
});

routes.post('/update_profile', function(req, res) {
  user_db_actions.UpdateUser(req, client, function(error, result){
    if(error) { console.log(error); }
  });
});

routes.post('/update_password', function(req, res) {
  user_db_actions.UpdateUserPassword(req, client, function(error, result){
    if(error) { console.log(error); }
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
  user_db_actions.ClaimReward(req.query.user_email, req.query.reward_id, 
    req.query.creator_username, req.query.reward_amount, '');
});

routes.get('/unclaim_reward', function (req, res) {
  console.log(req.query);
  paypal.CancelSubscription(req.query.subscriptionid, function (err, res) {
    if(!err) {
      console.log(res);
      user_db_actions.UnClaimReward(req.query.user_email, req.query.reward_id, req.query.creator_username, req.query.amount);
    }
  });
});
/*routes.get('/get_rewards', function (req, res) {
  user_db_actions.GetRewards(req.query.user_email, function(error, result){
    var rewards = result.rows;
    res.render('layouts/partials/homepage/support', {
        rewards: rewards,
        title: 'BackStage'
    });
  });
});*/

routes.get('/creators', function (req, res) {
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
  user_db_actions.LoadCategoriesAndCreators(req.user.email, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log('Result: ' + result);
      category_db_actions.LoadCategories(client, result[0], function (error, categories) {
        if (error) {
          console.log(error);
        } else {
          console.log('Result: ' + categories);
          creator_db_actions.LoadCreatorsWithCategories(client, result[1], function (error, creators) {

            res.render('layouts/profile', {
              user: req.user, // get the user out of session and pass to template
              categories: JSON.parse(categories),
              creators: JSON.parse(creators),
              title: 'Profile'
            });
          });
        }
      });
    }
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
