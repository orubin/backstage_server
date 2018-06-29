var cassandra = require('cassandra-driver');
//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['34.252.248.215'], keyspace: 'backstage_db' });

var models = require('express-cassandra');

const bcrypt = require('bcrypt');

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
			var select = "SELECT email, password, name, phone FROM user WHERE email=? ALLOW FILTERING";
			client.execute(select, [email], function (err, result) {
				if (err != null) {
					return cb(err, null);
				}
				if(result.rows[0]!==undefined){
					// console.log(result.rows);
					// console.log(result.rows[0]);
					return cb(null, result.rows[0]);
					// console.log('Got user profile:  ' + result.rows[0].email + ' / ' + result.rows[0].password);
				}
				return cb(null, null);
			});
		});
	},

	UpdateUser: function (req, client, res) {
		var post = req.body;
		const query = 'UPDATE user SET name = ?, phone = ? WHERE email = ?';
		var name = post.first_name + ' ' + post.last_name;
		const params = [name, post.phone, post.email];
		client.execute(query, params, { prepare: true }, function (err, result) {
			if (err != null) {
				return res(err, null);
			}
			return res(null, 'ok');
		});
	},

	UpdateUserPassword: function (req, client, res) {
		var post = req.body;

		//check for existing password
		if (!bcrypt.compareSync(post.current_password, req.user.password))
			return res('Wrong current password', null);

		bcrypt.hash(post.new_password, 10, (err, hash) => {
			if (err) {
				return res(err, null); 
			} else {
				const query = 'UPDATE user SET password = ? WHERE email = ?';

				const params = [hash, req.user.email];
				client.execute(query, params, { prepare: true }, function (err, result) {
					if (err != null) {
						return res(err, null);
					}
					return res(null, 'ok');
				});
			}
		});
	},

	DeleteUser: function (req, res, client) {
		var post = req.body;
		const query = 'DELETE FROM user WHERE email = ?';
		const params = [post.email];
		// Set the prepare flag in the query options
		client.execute(query, params, { prepare: true });
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

	LoadCategoriesAndCreators: function (email, res) {
		// var categories = models.instance.UserCategory.find({email: email}, function(err, result){
		// 	if(err) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	console.log(result);
		// 	return result;
		// });

		// var creators = models.instance.UserCreators.find({user_email: email}, function(err, result){
		// 	if(err) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	console.log(result);
		// 	return result;
		// });
		// return [categories, creators];
		return res(null, [1,1]);
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

	FollowCreator: function (user, creator_username) {
		var userFollow = new models.instance.UserCreators({
			id: models.uuid(),
			user_email: user.email,
			creator_username: creator_username,
			updated_at: Date.now(),
			created_at: Date.now()
		});
		userFollow.save(function(err){
			if(err) {
				return done(err); // FIX THIS
			}
		});
	},

	UnFollowCreator: function (user, creator_username) {
		var userFollow = models.instance.UserCreator.find(user.email);
		userFollow.DeleteUser;
	},

	ClaimReward: function (user, reward_id, creator_username, amount) {
		// increase amount of creator funding
		
		const query = 'SELECT funding_amount FROM creator where username = ' + creator_username;
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			var funding_amount = result.rows[0];
			const query = 'UPDATE creator where username = ' + creator_username + ' SET funding_amount = ' + funding_amount + amount;
			client.execute(query, function (err, result) {
				console.log('Error + ' + err);
			});
		});

		var reward = new models.instance.UserReward({
			id: models.uuid(),
			user_email: user.email,
			creator_username: creator_username,
			reward_id: reward_id,
			amount: amount,
			updated_at: Date.now(),
			created_at: Date.now()
		});
		reward.save(function(err){
			if(err) {
				return done(err);
			}
		});
	},

	UnClaimReward: function (user, reward_id, creator_username, amount) {
		// decrease amount of creator funding
		const query = 'SELECT funding_amount FROM creator where username = ' + creator_username;
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			var funding_amount = result.rows[0];
			const query = 'UPDATE creator where username = ' + creator_username + ' SET funding_amount = ' + funding_amount - amount;
			client.execute(query, function (err, result) {
				console.log('Error + ' + err);
			});
		});

		const query2 = 'DELETE from userreward where creator_username = ' + creator_username + ' AND user_email = ' + user.email;
		client.execute(query2, function (err, result) {
			console.log('Error + ' + err);
		});

	}
}