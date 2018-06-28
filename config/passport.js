// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

const user_db_actions = require('../user_db_actions');

const bcrypt = require('bcrypt');

var models = require('express-cassandra');

models.setDirectory( __dirname + '/../models').bind(
    {
        clientOptions: {
            contactPoints: ['34.252.248.215'],
            protocolOptions: { port: 9042 },
            keyspace: 'backstage_db',
            queryOptions: {consistency: models.consistencies.one}
        },
        ormOptions: {
            defaultReplicationStrategy : {
                class: 'SimpleStrategy',
                replication_factor: 1
            },
            migration: 'drop'
        }
    },
    function(err) {
        if(err) throw err;
    }
);

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function (email, done) {
        user_db_actions.findByEmailDb(email, function (err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    });

    // // =========================================================================
    // // LOCAL SIGNUP ============================================================
    // // =========================================================================
    // // we are using named strategies since we have one for login and one for signup
    // // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) {

            // asynchronous
            process.nextTick(function () {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                user_db_actions.findByEmailDb(email, function (err, user) {
                    // if there are any errors, return the error
                    if (err) { return done(err); }

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        bcrypt.hash(password, 10, (err, hash) => {
                            if (err) {
                                return done(err); 
                            } else {
                                var user = new models.instance.User({
                                    id: models.uuid(),
                                    name: req.body.username,
                                    email: email,
                                    password: hash,
                                    updated_at: Date.now(),
                                    created_at: Date.now()
                                });
                                user.save(function(err){
                                    if(err) {
                                        return done(err); 
                                    }
                                });
                                return done(null, user);
                            }
                        });
                    }

                });

            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, cb) { // callback with email and password from our form

            user_db_actions.findByEmailDb(email, function (err, user) {
                if (err) { return cb(err); }
                // if (!user) { return cb(null, false); }
                if (!user)
                    return cb(null, false, req.flash('signupMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, user.password))
                    return cb(null, false, req.flash('signupMessage', 'Oops! Wrong password.')); // create the signupMessage and save it to session as flashdata

                return cb(null, user);
            });

        }));

};
