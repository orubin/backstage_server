/*
	Creator Table:
    1. Name - String
    2. Email - String
    3. Password - String
    4. Profile Image - Image
    8. PayPal Account - String (email)
    9. Description - String
    10. Welcome Video - String(Youtube Link)

    Reward Table:
    1. Name - String
    2. Image - String
    3. Price - Number
    4. Description - String
*/

module.exports = {
	InsertCreator : function (req, res, client){
        const query = 'INSERT INTO creators (email, name, phone, address, city) VALUES (?,?,?,?,?)'; 
        const params = [ post.email, post.name, post.phone, post.address, post.city ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("INSERT INTO creators (email, name, phone, address, city) VALUES (?,?,?,?,?)", [post.email, post.name, post.phone, post.address, post.city], function(err, results){
					res.redirect('/');
				});
		    }
        });
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
        .then(result => console.log('Row updated on the cluster'));
	},
	UpdateCreator : function (req, res, client){
        var post = req.body;
        const query = 'UPDATE creators SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?'; 
        const params = [ post.name, post.phone, post.address, post.city, post.id ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("UPDATE creators SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?", [post.name, post.phone, post.address, post.city, post.id], function(err, results){
					res.redirect('/');
				});
		    }
		});
	},
	DeleteCreator : function (req, res, client){
        var post = req.body;
        const query = 'DELETE FROM creators WHERE id = ?'; 
        const params = [ post.id ];
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
	},
	LoadCreator : function (client, id){
		// const query = 'SELECT * FROM creators WHERE id = ' + id;
        // // Set the prepare flag in the query options
		// const query = 'SELECT * FROM creator';

		// client.execute(query, function (err, result) {
		// 	var data = '{"name":"'+result.rows[0].name+'", "description":"'+result.rows[0].description+'", "profile_picture":"'+result.rows[0].img_src+'", "cover_picture":"'+result.rows[0].img_src+'", "intro_video":"'+result.rows[0].img_src+'", "date":"'+result.rows[0].created_at+'"}'
		// 	return res(null, data);
		// });
		//return '{"name":"Kevin Stewart", "description":"internet videos and podcasts", "profile_picture":"https://lorempixel.com/400/200/people", "cover_picture":"https://lorempixel.com/400/200/people", "intro_video":"https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"}';
		if (id<2) {
			return '{"name": "Hadag Nahash", "username": "hadagnahash", "email": "hadagnahash@backstage.com", "paypal": "hadagnahash@gmail.com", "tagline": "#1 Hip Hop Band in the Middle East", "overview": "Hadag Nahash has been a major contributor to the Israeli hip-hop scene, and is presently one of Israels most successful bands, with seven studio albums released to date. The bands songs call for peace, tolerance and equality, and include political and social protest. Most songs are written by Shaanan Street, the bands lead vocalist.", "video": "https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4","sponsors": 680,"monthly_income": 4500,"": "","profile": "https://cdn.thinglink.me/api/image/608247153780850690/1240/10/scaletowidth","cover_picture":"https://lorempixel.com/400/200/city","category": {"type": "Music","img": "https://musicaustralia.org.au/wp-content/uploads/2017/02/livemusic-portdhiver-web-ed.jpg"},"rewards": [{"title": "$5 donation - Starter Bro","price": 5,"description": "Become a Starter Bro of the hadagnahash, you get early access to all the videos we make + weekly updated Spotify secret playlist","img": "https://lorempixel.com/400/200/city"},{"title": "$10 donation - Pro Bro","price": 10,"description": "Become a Pro Bro of the hadagnahash, you get a free ticket to our show when we perform in your city."},{"title": "15 donation - Super Bro","price": 15,"description": "Become a Super Bro of the hadagnahash, you get backstage entry to you and a friend to meet us after the show and talk shit. BYOB.","img": "https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936"},{"title": "$20 donation - True Bro","price": 20,"description": "Become a True Bro of the hadagnahash, you get all rewards + kiss from mooky. <3","img": "https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936"}],"posts": [{"title": "hello Fish Snake","body": "this is our last tour day, see you next year"},{"title": "hello Pish Snake","body": "this is our last tour week, see you next year"},{"title": "hello Kish Snake","body": "this is our last tour month, see you next year"},{"title": "hello Mish Snake", "body": "this is our last tour season, see you next year"}]}';
		} else {
			return '{"name": "Hadag Nahash", "username": "hadagnahash", "email": "hadagnahash@backstage.com", "paypal": "hadagnahash@gmail.com", "tagline": "#1 Hip Hop Band in the Middle East", "overview": "Hadag Nahash has been a major contributor to the Israeli hip-hop scene, and is presently one of Israels most successful bands, with seven studio albums released to date. The bands songs call for peace, tolerance and equality, and include political and social protest. Most songs are written by Shaanan Street, the bands lead vocalist.", "video": "","sponsors": 680,"monthly_income": 4500,"": "","profile": "https://cdn.thinglink.me/api/image/608247153780850690/1240/10/scaletowidth","cover_picture":"https://lorempixel.com/400/200/city","category": {"type": "Music","img": "https://musicaustralia.org.au/wp-content/uploads/2017/02/livemusic-portdhiver-web-ed.jpg"},"rewards": [{"title": "$5 donation - Starter Bro","price": 5,"description": "Become a Starter Bro of the hadagnahash, you get early access to all the videos we make + weekly updated Spotify secret playlist","img": "https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936"},{"title": "$10 donation - Pro Bro","price": 10,"description": "Become a Pro Bro of the hadagnahash, you get a free ticket to our show when we perform in your city."},{"title": "15 donation - Super Bro","price": 15,"description": "Become a Super Bro of the hadagnahash, you get backstage entry to you and a friend to meet us after the show and talk shit. BYOB.","img": "https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936"},{"title": "$20 donation - True Bro","price": 20,"description": "Become a True Bro of the hadagnahash, you get all rewards + kiss from mooky. <3","img": "https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936"}],"posts": [{"title": "hello Fish Snake","body": "this is our last tour day, see you next year"},{"title": "hello Pish Snake","body": "this is our last tour week, see you next year"},{"title": "hello Kish Snake","body": "this is our last tour month, see you next year"},{"title": "hello Mish Snake", "body": "this is our last tour season, see you next year"}]}';
		}
	},
	LoadCreators : function (client, ids){
		const query = 'SELECT * FROM creators WHERE category_id in (?)';
        // Set the prepare flag in the query options
        // client.execute(query, [ids] function (err, result) {
		// 	return (result.rows[0]);
		// });
		return '{"creators":[{"name":"John", "description":"Doe", "profile_picture":"picture", "cover_picture":"cover_picture", "intro_video":"intro_video"}, {"name":"John2", "description":"Doe2", "profile_picture":"picture2", "cover_picture":"cover_picture2", "intro_video":"intro_video2"}]}';
	}
}