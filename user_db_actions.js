const bcrypt = require('bcrypt');
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
		if(result){
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

	dbInsert: function (req) {

		// // var insert = "INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (uuid(), ?, ?, ?, now(), now())";
		// // client.execute(insert, [req.body.email, req.body.password, req.body.username], function (err, result) {
		// // 	console.log(err);
		// // 	console.log('sign up successfully: ' + req.body.email + ' / ' + req.body.password);
		// // });
		// // res.redirect('/');


		// //check if user exists:
		// var existingUser = LoadUser(req.body.email);
		// if (existingUser) {
		// 	console.log('Existing');
		// 	return 'Existing';
		// }

		var query = "INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (uuid(), ?, ?, ?, now(), now())";
		bcrypt.hash(req.body.password, 10, (err, hash) => {
			if (err) {
				return 500;
			} else {
				client.execute(query, [req.body.email, hash, req.body.username], { prepare: true })
					.then(result => {
						console.log('sign up successfully: ' + req.body.email + ' / ' + req.body.password);
					});
			}
		});

	},

	InsertUser: function (client, email, password) {
		//check if user exists:
		var existingUser = this.LoadUser(client, email);
		console.log('Existin user:' + existingUser);

		if (existingUser) {
			return 'Existing';
		}

		const query = 'INSERT INTO users (email, password) VALUES (?,?)';
		bcrypt.hash(password, 10, (err, hash) => {
			if (err) {
				return 500;
			} else {
				client.execute(query, [email, hash], { prepare: true })
					.then(result => console.log('Row updated on the cluster'));
			}
		});

		// client.execute(function(err, keyspace){
		//     if(err){
		//     	throw(err);
		//     } else {
		//     	var post = req.body;
		// 		client.cql("INSERT INTO users (email, password) VALUES (?,?,?,?,?)", [post.email, post.name, post.phone, post.address, post.city], function(err, results){
		// 			res.redirect('/');
		// 		});
		//     }
		// });
		// Set the prepare flag in the query options

	},

	UpdateUser: function (req, res, client) {
		var post = req.body;
		const query = 'UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE email = ?';
		const params = [post.name, post.phone, post.address, post.city, post.email];
		client.execute(function (err, keyspace) {
			if (err) {
				throw (err);
			} else {
				var post = req.body;
				client.cql("UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE email = ?", [post.name, post.phone, post.address, post.city, post.usersEdit], function (err, results) {
					res.redirect('/');
				});
			}
		});
	},

	DeleteUser: function (req, res, client) {
		var post = req.body;
		const query = 'DELETE FROM users WHERE lastname = ?';
		const params = [post.lastname];
		// Set the prepare flag in the query options
		client.execute(query, params, { prepare: true })
	},

	LoadUser: function (client, email) {
		const query = 'SELECT * FROM users';
		if (typeof (email) != "undefined") {
			query += " WHERE email = '" + email + "'";
		}
		// Set the prepare flag in the query options
		client.execute(query, function (err, result) {
			return result.rows[0];
		});
	},
	LoadUserOLD: function (req, res, client) {
		client.execute(function (err, keyspace) {
			if (err) {
				throw (err);
			} else {
				var query = "SELECT * FROM users";
				if (typeof (req.query.email) != "undefined") {
					query += " WHERE email = '" + req.query.email + "'";
				}
				client.cql(query, [], function (err, results) {
					var data = [];
					results.forEach(function (row) {
						var obj = {};
						row.forEach(function (name, value, ts, ttl) {
							obj[name] = value;
						});
						data.push(obj);
					});
					res.send(data);
				});
			}
		});
	}
}