var models = require('express-cassandra');

models.setDirectory( __dirname + '/models').bind(
    {
        clientOptions: {
            contactPoints: ['34.246.184.55'],
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

module.exports = {

	models : models,
	
	InsertCreator : function (req, res, client){
		var post = req.body;
        const params = [ post.email, post.name, post.phone, post.address, post.city ];
		var creator = new models.instance.Creator({
			id: models.uuid(),
			name: post.name,
			username: post.username,
			email: post.email,
			password: '',
			paypal_address: post.paypal_address,
			tagline: post.tagline,
			overview: post.overview,
			video: 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
			sponsors: 0,
			monthly_income: 0,
			profile: '',
			cover_picture: '',
			category_id: 0,
			updated_at: Date.now(),
			created_at: Date.now()
		});

		creator.save(function(err){
			if(err) {
				console.log(err);
			}
		});
	},
	UpdateCreator : function (req, res, client){
        var post = req.body;
        const query = 'UPDATE creator SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?'; 
        const params = [ post.name, post.phone, post.address, post.city, post.id ];
		client.execute(function(err, keyspace){
		    if(err){
		    	throw(err);
		    } else {
		    	var post = req.body;
				client.cql("UPDATE creator SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?", [post.name, post.phone, post.address, post.city, post.id], function(err, results){
					res.redirect('/');
				});
		    }
		});
	},
	DeleteCreator : function (req, res, client){
        var post = req.body;
        const query = 'DELETE FROM creator WHERE username = ?'; 
        const params = [ post.username ];
        // Set the prepare flag in the query options
        client.execute(query, params, { prepare: true })
	},
	LoadCreator : function (client, name, res){
		const query = 'SELECT * FROM creator WHERE username = ?';
		const params = [ name ];
		client.execute(query, params, { prepare: true }, function (err, result) {
			if(err) {
				console.log(err);
			}
			
			if (result !== undefined){
				var data = JSON.stringify(result.rows[0]);
				var obj = JSON.parse(data);
				const query2 = 'select * from creatorrewards where creator_username = ? ALLOW FILTERING';
				client.execute(query2, params, { prepare: true }, function (err, result) {
					if(err) {
						console.log(err);
						return res(err, {});
					}
					else{
						obj['rewards'] = JSON.parse(JSON.stringify(result.rows));
						obj['category'] = JSON.parse('{"type": "Music","img": "https://musicaustralia.org.au/wp-content/uploads/2017/02/livemusic-portdhiver-web-ed.jpg"}');
						obj['posts'] = JSON.parse('[{"title": "hello Fish Snake","body": "this is our last tour day, see you next year"},{"title": "hello Pish Snake","body": "this is our last tour week, see you next year"},{"title": "hello Kish Snake","body": "this is our last tour month, see you next year"},{"title": "hello Mish Snake", "body": "this is our last tour season, see you next year"}]');
						var result = JSON.stringify(obj);
						return res(null, result);
					}
					//console.log("Data:" + JSON.stringify(result.rows));
					
				});
				//return res(null, JSON.stringify(result.rows[0]));
			}
		 });
	},
	LoadCreators : function (client, res){
		const query = 'SELECT * FROM creator ALLOW FILTERING';
        client.execute(query, function (err, result) {
			if(err) {
				console.log(err);
				return res(err, {});
			}
			return res(null, JSON.stringify(result.rows));
		});
	},
	LoadCreatorsWithCategory : function (client, category_id, res){
		const query = 'SELECT * FROM creator where category_id = ? ALLOW FILTERING';
		const params = [ category_id ];
        client.execute(query, params, { prepare: true }, function (err, result) {
			if(err) {
				console.log(err);
				return res(err, {});
			}
			return res(null, result.rows);
		});
	},
	LoadCreatorsWithCategories : function (client, ids, res){
		var vars = '?';
		for (i = 1; i < ids.length; i++) {
			vars = vars + ',?'
		}
		const query = 'SELECT * FROM creator WHERE category_id in ('+vars+') ALLOW FILTERING';
        // Set the prepare flag in the query options
        client.execute(query, ids, { prepare: true }, function (err, result) {
        	if(err) {
				console.log(err);
				return res(err, {});
			}
		 	return res(null, result.rows);
		});
	},
	InsertContent : function (client){

		var creators_names = ['Hadag Nahash','Mosh Ben Ari','Idan Raichel','Jane Bordeaux','Subliminal','Uravity','Poirot','Khan','KittyCat GoMeowMeow','Garou'];
		var creators_usernames = ['hadagnahash', 'moshbenari', 'idanraichel', 'janebordeaux', 'subliminal','uraraka', 'hercules', 'hermit', 'meowmeow', 'villian'];
		var creators_taglines = ['#1 Hip Hop Band in the Middle East', 'Authentic and down to earth', 'Bringing world sound to your ears', 'We are a band from Tel-Aviv, making Live n kickin american folk-country style music in Hebrew.', 'Israel\'s rap wizard','A Hero in the making','Who needs Sherlock','Nemisis of James T. Kirk','Meow','The next greatest monster'];
		var overview0 = 'Hadag Nahash has been a major contributor to the Israeli hip-hop scene, and is presently one of Israels most successful bands, with seven studio albums released to date. The bands songs call for peace, tolerance and equality, and include political and social protest. Most songs are written by Shaanan Street, the bands lead vocalist.';
		var overview1 = 'Ben Ari was born in Afula, Israel in 1970. He comes from a Yemenite and Iraqi Jewish background. He first discovered music as a child through the traditional Jewish and ethnic chants that were part of his everyday life. He started playing music at the age of 16 and since he has studied music around the world, including in India, Sahara and Sinai. He plays various string instruments such as acoustic and classic guitar, Indian sarod, Persian tar, Turkish jumbush, Moroccan ginberi and bass.';
		var overview2 = 'Idan Raichel was born in Kfar Saba, Israel. He began to play the accordion at the age of nine. He was attracted to gypsy music and tango, and studied jazz piano in high school.Raichel served in the Israel Defense Forces army band at the age of 18, performing covers of Israeli and Western pop hits at military bases around the country.[4] As the musical director of the group, he learned to do arrangements and produce live shows.';
		var overview3 = '';
		var overview4 = 'Subliminal was born in Tel Aviv, Israel to a Persian Jewish mother and Tunisian Jewish father. Subliminal started performing music at age 12, and at age 15 met Yoav Eliasi. The two quickly became friends as a result of their mutual love of hip-hop.';
		var creators_overviews = [overview0, overview1, overview2, overview3, overview4, overview3, overview3, overview3, overview3, overview3];
		var i;
		for (i = 0; i < creators_names.length; i++) {
			var creator = new models.instance.Creator({
				id: models.uuid(),
				name: creators_names[i],
				username: creators_usernames[i],
				email: creators_usernames[i] + '@backstage.com',
				password: '',
				paypal_address: creators_usernames[i] + '@gmail.com',
				tagline: creators_taglines[i],
				overview: creators_overviews[i],
				video: 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
				sponsors: parseInt(5000 / (i+1)),
				monthly_income: parseInt(25000 / (i+1)),
				profile: 'https://cdn.thinglink.me/api/image/608247153780850690/1240/10/scaletowidth',
				cover_picture: '../city.jpeg',
				category_id: 1,
				updated_at: Date.now(),
				created_at: Date.now()
			});
	
			creator.save(function(err){
				if(err) {
					console.log(err);
				}
			});
		}

		var rewards_titles = ['$5 donation - Starter Bro', '$10 donation - Pro Bro', '15$ donation - Super Bro', '$20 donation - True Bro'];
		var rewards_price = [5, 10, 15, 20];
		var rewards_description = ['Become a Starter Bro: you get early access to all the videos we make + weekly updated Spotify secret playlist', 'Become a Pro Bro: you get a free ticket to our show when we perform in your city.', 'Become a Super Bro: you get backstage entry to you and a friend to meet us after the show and talk shit. BYOB.', 'Become a True Bro: you get all rewards + kiss from mooky'];
		var rewards_images = ['../city.jpeg', '../city.jpeg', 'https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936', 'https://media.istockphoto.com/photos/gift-box-with-white-background-picture-id516815936'];

		for (var j = 0; j < creators_usernames.length-1; j++) {
			for (i = 0; i < rewards_titles.length; i++) {
				var reward = new models.instance.CreatorRewards({
					id: models.uuid(),
					creator_username: creators_usernames[j],
					title: rewards_titles[i],
					price: rewards_price[i],
					description: rewards_description[i],
					img: rewards_images[i],
					updated_at: Date.now(),
					created_at: Date.now()
				});
		
				reward.save(function(err){
					if(err) {
						console.log(err);
					}
				});
			}
		}
	}
}