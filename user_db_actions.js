module.exports = {
	InsertUser : function (req, res, client){
        const query = 'INSERT INTO users (email, name, phone, address, city) VALUES (?,?,?,?,?)'; 
        const params = [ new Date(1942, 10, 1), 'jimi-hendrix' ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("INSERT INTO users (email, name, phone, address, city) VALUES (?,?,?,?,?)", [post.email, post.name, post.phone, post.address, post.city], function(err, results){
					res.redirect('/');
				});
		    }
        });
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
        .then(result => console.log('Row updated on the cluster'));
	},
	UpdateUser : function (req, res, client){
        var post = req.body;
        const query = 'UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE email = ?'; 
        const params = [ post.name, post.phone, post.address, post.city, post.email ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE email = ?", [post.name, post.phone, post.address, post.city, post.usersEdit], function(err, results){
					res.redirect('/');
				});
		    }
		});
	},
	DeleteUser : function (req, res, client){
        var post = req.body;
        const query = 'DELETE FROM users WHERE lastname = ?'; 
        const params = [ post.lastname ];
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
	},
	LoadUser : function (req, res, client){
		const query = 'SELECT * FROM users'; 
		if(typeof(req.query.email) != "undefined"){
			query += " WHERE email = '"+req.query.email+"'";
		}
        // Set the prepare flag in the query options
        client.execute(query, function (err, result) {
			res.send(result.rows[0]);
		});
	},
	LoadUserOLD : function (req, res, client){
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var query = "SELECT * FROM users";
		    	if(typeof(req.query.email) != "undefined"){
		    		query += " WHERE email = '"+req.query.email+"'";
		    	}
				client.cql(query, [], function(err, results){
					var data = [];
					results.forEach(function(row){
						var obj = {};
					  	row.forEach(function(name,value,ts,ttl){
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