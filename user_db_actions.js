var cassandra = require('cassandra-driver');
//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'backstage_db' });

var models = require('express-cassandra');

models.setDirectory( __dirname + '/../models').bind(
    {
        clientOptions: {
            contactPoints: ['127.0.0.1'],
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

function LoadUser(email) {
	var query = 'SELECT * FROM users';
	if (typeof (email) != "undefined") {
		query += " WHERE email = '" + email + "'";
	}
	// Set the prepare flag in the query options
	client.execute(query, function (err, result) {
		if (result) {
			return result.rows[0];
		}
	});
};

module.exports = {

	findByEmailDb: function (email, cb) {
		process.nextTick(function () {
			var select = "SELECT email, password, name FROM user WHERE email=?";
			client.execute(select, [email], function (err, result) {
				if (err != null) {
					return cb(err, null);
				}
				// console.log('Got user profile:  ' + result.rows[0].email + ' / ' + result.rows[0].password);
				return cb(null, result.rows[0]);
			});
		});
	},

	UpdateUser: function (req, res, client) {
		var post = req.body;
		const query = 'UPDATE user SET name = ? WHERE email = ?';
		const params = [post.name, post.email];
		client.execute(function (err, keyspace) {
			if (err) {
				throw (err);
			} else {
				var post = req.body;
				client.cql("UPDATE user SET name = ?, phone = ?, address = ?, city = ? WHERE email = ?", [post.name, post.phone, post.address, post.city, post.usersEdit], function (err, results) {
					res.render('layouts/profile', {
						user : req.user, // get the user out of session and pass to template
						message: req.flash('profile_details', 'Details Updated!')
					});
				});
			}
		});
	},

	DeleteUser: function (req, res, client) {
		var post = req.body;
		const query = 'DELETE FROM user WHERE email = ?';
		const params = [post.email];
		// Set the prepare flag in the query options
		client.execute(query, params, { prepare: true })
	},

	LoadUser: function (client, email) {
		const query = 'SELECT * FROM user';
		if (typeof (email) != "undefined") {
			query += " WHERE email = '" + email + "'";
		}
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			return result.rows[0];
		});
	},

	LoadCategoriesAndCreators: function (email) {
		// var categories = models.instance.UserCategory.find({email: email}, function(err, result){
		// 	if(err) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	console.log(result);
		// 	return result;
		// });

		// var creators = models.instance.UserCreator.find({user_email: email}, function(err, result){
		// 	if(err) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	console.log(result);
		// 	return result;
		// });
		// return [categories, creators];
		return [0,0];
	},

	LoadMessages: function (user) {
		if(user){
			// var messages = models.instance.Message.find({email: user.email}, function(err, result){
			// 	if(err) {
			// 		console.log('ERROE!!' + err);
			// 		return;
			// 	}
			// 	console.log(result);
			// 	return result;
			// });
		}
		return {};//messages;
	},

	FollowCreator: function (user, creator_id) {
		var userFollow = new models.instance.UserCreator({
			id: uuid(), // Check for UUID function
			user_email: user.email,
			creator_id: creator_id,
			updated_at: Date.now(),
			created_at: Date.now()
		});
		userFollow.save(function(err){
			if(err) {
				return done(err); // FIX THIS
			}
		});
	},

	UnFollowCreator: function (user, creator_id) {
		var userFollow = models.instance.UserCreator.find(user.email);
		userFollow.DeleteUser;
	},

	ClaimReward: function (user, reward_id) {

	}
}