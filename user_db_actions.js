var cassandra = require('cassandra-driver');
//Connect to the cluster
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'backstage_db' });

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
		return [1,2];
	},

	LoadMessages: function (email) {
		return "MSG";
	}
}