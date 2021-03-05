
module.exports = {
	InsertCategory : function (req, res, client){
        const query = 'INSERT INTO categories (email, name, phone, address, city) VALUES (?,?,?,?,?)'; 
        const params = [ post.email, post.name, post.phone, post.address, post.city ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("INSERT INTO categories (email, name, phone, address, city) VALUES (?,?,?,?,?)", [post.email, post.name, post.phone, post.address, post.city], function(err, results){
					res.redirect('/');
				});
		    }
        });
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
        .then(result => console.log('Row updated on the cluster'));
	},
	UpdateCategory : function (req, res, client){
        var post = req.body;
        const query = 'UPDATE categories SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?'; 
        const params = [ post.name, post.phone, post.address, post.city, post.id ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("UPDATE categories SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?", [post.name, post.phone, post.address, post.city, post.id], function(err, results){
					res.redirect('/');
				});
		    }
		});
	},
	DeleteCategory : function (req, res, client){
        var post = req.body;
        const query = 'DELETE FROM categories WHERE id = ?'; 
        const params = [ post.id ];
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
	},
	LoadCategory : function (client, id){
		const query = 'SELECT * FROM categories WHERE id = ' + id;
        // client.execute(query, function (err, result) {
		// 	return (result.rows[0]);
		// });
		return '{"name":"John", "description":"Doe", "profile_picture":"picture", "cover_picture":"cover_picture", "intro_video":"intro_video"}';
	},
	LoadCategories : function (client, ids, res){
		const query = 'SELECT * FROM category WHERE category_id in (?)';
		const params = [ ids ]
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true }, function (err, result) {
			if(err){
				return res(err, null);
			}
			console.log(result);
			return res(null, result.rows);
		});
		//return '{"name":"John", "description":"Doe", "profile_picture":"picture", "cover_picture":"cover_picture", "intro_video":"intro_video"}';
	}
}
