var cassandra = require('cassandra-driver');
//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['34.252.248.215'], keyspace: 'backstage_db' });

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
					// console.log('Got user profile:  ' + result.rows[0].email + ' / ' + result.rows[0].password);
				}
				return cb(null, result.rows[0]);
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

	FollowCreator: function (user, creator_id) {
		var userFollow = new models.instance.UserCreators({
			id: models.uuid(),
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

	ClaimReward: function (userEmail, reward_id, creator_id, amount) {
		// increase amount of creator funding
		const query = 'SELECT funding_amount FROM creator where id = ' + creator_id;
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			var funding_amount = result.rows[0];
			const query = 'UPDATE creator where id = ' + creator_id + ' SET funding_amount = ' + funding_amount + amount;
			client.execute(query, function (err, result) {
				console.log('Error + ' + err);
			});
		});

		var reward = new models.instance.UserReward({
			id: models.uuid(),
			user_email: userEmail,
			creator_id: Number(creator_id),
			reward_id: Number(reward_id),
			amount: Number(amount),
			updated_at: Date.now(),
			created_at: Date.now()
		});
		reward.save(function(err){
			if(err) {
				console.log(err);
			}
		});
	},

	UnClaimReward: function (user, reward_id, creator_id, amount) {
		// decrease amount of creator funding
		const query = 'SELECT funding_amount FROM creator where id = ' + creator_id;
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			var funding_amount = result.rows[0];
			const query = 'UPDATE creator where id = ' + creator_id + ' SET funding_amount = ' + funding_amount - amount;
			client.execute(query, function (err, result) {
				console.log('Error + ' + err);
			});
		});

		const query2 = 'DELETE from user_reward where creator_id = ' + creator_id + ' AND user_email = ' + user.email;
		client.execute(query2, function (err, result) {
			console.log('Error + ' + err);
		});

	}
}