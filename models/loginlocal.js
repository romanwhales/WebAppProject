var Waterline = require('waterline');
var bcrypt = require('bcryptjs');
var User = Waterline.Collection.extend({
	identity:'loginusers',
	connection:'myPostgres',
	migrate:'create',
	attributes:{
		id:{
			type: 'integer',
      		primaryKey: true,
      		autoIncrement: true
		},
		username:{
			type:'string',
			required:true
		},
		password:{
			type:'string',
			required:true
		},
		email:{
			type:'string',
			required:true
		},
		resetPasswordToken:{
			type:'string'
		},
		resetPasswordExpires:{
			type:'string'
		},
		bio:{
			type:'string'
		},
		//Refernece to user's followers
		userFollowers:{
			collection:'UserFollower',
			via:'user'
		},
		//Reference to users that user is following
		userFollowing:{
			collection:'UserFollower',
			via:'follower'
		}
	},
	beforeCreate:function(user,cb){
		bcrypt.genSalt(10,function(err,salt){
			bcrypt.hash(user.password,salt,function(err,hash){
				if(err){
					console.log('Error from hashing ',err);
				}else{
					user.password = hash;
					cb();
					console.log('The hashed password is ',hash);
				}
			})
		})
	}
})
module.exports = User;