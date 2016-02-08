// facebookAppID: 222720821394921,
// API Version: v2.5,
// App Secret: cef1828808391304d2a1be7ca8d9b21f
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var router = express.Router();
var user = require('../models/loginlocal');
var FACEBOOK_APP_ID = '222720821394921';
var FACEBOOK_APP_SECRET ='cef1828808391304d2a1be7ca8d9b21f';
var GOOGLE_ID = '387460554373-2tfvf9cc140a45bkg7t9arca1tpaoiog.apps.googleusercontent.com';
var GOOGLE_SECRET ='FZ30E5r41bGxvpE934hRBm4Z';
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}
passport.serializeUser(function(user,done){
	//used to serialize user for the session
	done(null,user);
});
passport.deserializeUser(function(user,done){
	//used to deserialize the user.
	done(null,user);
});
passport.use(new GoogleStrategy({
	clientID:GOOGLE_ID,
	clientSecret:GOOGLE_SECRET,
	callbackURL:'http://localhost:3001/auth/google/callback',
	passReqToCallback:true
},function(req,token,refreshtoken,profile,done){
	//make the code asynchronous 
	//code in this block wont fire until we got data back from google.
	process.nextTick(function(){
		console.log('Google Profile is ',profile);
		return done(null,profile);
	})
}))
passport.use(new LocalStrategy({
	usernameField:'email',
	passwordField:'password',
	passReqToCallback:true
	},function(req,email,password,cb){
	req.models.loginusers.findOne({email:email},function(err,user){
		if (err){
			console.log('Error logging in ',err);
			return cb(err);
		}
		if(!user){
			return cb(null,false);
		}
		bcrypt.compare(password,user.password,function(err,res){
			console.log('Comparinfg is ',res);
			if(res === true){
				cb(null,user);
			}else{
				return cb(null,false);
			}
		})
		// if(user.password != password){
		// 	return cb(null,false);
		// }
		// return cb(null,user);
	})
}));
passport.use(new FacebookStrategy({
	clientID:FACEBOOK_APP_ID,
	clientSecret:FACEBOOK_APP_SECRET,
	callbackURL:"http://localhost:3001/auth/facebook/callback",
	passReqToCallback:true,
	profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
},function(req,accessToken,refreshToken,profile,done){
	process.nextTick(function(){
		console.log('Profile is ',profile);	
		return done(null,profile);
		
	})
}
));
passport.use(new TwitterStrategy({
	consumerKey:'zkVCWMwno5uwlBdUQstLXFOtj',
	consumerSecret:'2HpPSKTgp9NRsfJKbDpBoC5wVgjKOWY0Y9MT8NEGoyRPqdr93u',
	callbackURL:'http://127.0.0.1:3001/auth/twitter/callback'
},function(token,tokenSecret,profile,done){
	process.nextTick(function(){
		return done(null,profile);
	})
}
))

/* GET home page. */
router.get('/', nocache,function(req, res, next) {
	console.log('In index page authentication is ',req.isAuthenticated());
	// console.log('Cookies ',req.cookie);
	// console.log('request is ',req.headers);
	// console.log('Cookie is ',res.cookie());
	if(req.isAuthenticated()){
		console.log('Req is ',req.user);
		res.render('index', { user: req.user });
	}
	if(req.isAuthenticated() === false){
		res.render('login');
	}
});
router.get('/signup',function(req,res){
	res.render('signup');
});
router.post('/signupp',function(req,res){
	var data = req.body;
	console.log(data);

	createuser(data,req,res);
});
router.get('/forgot',function(req,res,next){
	console.log(req.headers.host);
	res.render('forgot');

});
router.post('/forgot',function(req,res){
	var token = crypto.randomBytes(20).toString('hex');
	console.log('Random byte is ',token);
	var mail = req.body.mail;
	console.log('Email is ',mail);
	var passwordexpiry = Date.now() + 3600000;
	console.log('Password Expiry ',passwordexpiry);
	req.models.loginusers.findOne({email:mail},function(err,user){
		if(user === undefined){
			console.log('No account with that email address exist');
			res.send('No account with that email address exists.');
		}
		else{
			console.log('User gotten is ',user);
			var passwordexpiry = Date.now() + 3600000;
			req.models.loginusers.update({email:mail},{resetPasswordToken:token,resetPasswordExpires:passwordexpiry}).exec(function afterwards(err,updated){
				if(!err){
					console.log('Updated is ',updated);
					var smtpTransport = nodemailer.createTransport('SMTP',{
						service:'Gmail',
						auth:{
							user:'walesunmonu@gmail.com',
							pass:'buraimo31'
						}
					});
					smtpTransport.sendMail({
						from:'walesunmonu@gamil.com',
						to:mail,
						subject:'Password Reset',
						text:'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'+
						'Please click on the following link, or paste this into your browser to complete the process:\n\n '+ req.headers.host +'/reset/'+token +'\n\n'+
						'If you did not request this, Please ignore this email and your password will remian unchanged.\n'
					},function(err){
						if(err){
							console.log('oga here is your error ',err);
						}else{
							console.log('Email sent check inbox');
							res.send('An email has been sent to '+ mail+ 'with further instructions.');
						}
					})		
				}else{
					console.log('Error is ',err);
				}
			})
		}
	})	
});
router.get('/reset/:token',function(req,res){
	var tokengotten = req.params.token;
	console.log('Token gotten is ',tokengotten);
	req.models.loginusers.findOne({resetPasswordToken:tokengotten}).exec(function findOneCB(err,found){
		if(found){
			console.log('Found is',found);
			var currentTime = Date.now();
			console.log(currentTime <=found.resetPasswordExpires);
			if(currentTime <= found.resetPasswordExpires){
				res.render('resetpassword');
			}else{
				res.render('errortoken');
			}
		}else{
			res.send('You have entered the wrong link');
		}
	})
});
router.post('/reset/:token',function(req,res){
	console.log('Token is ',req.params.token);
	console.log('Body is ',req.body);
	var token = req.params.token;
	var pass1 = req.body.newpassword;
	var pass2 = req.body.confirmpasword;
	if(pass1 === pass2){
		console.log('I am in here');
		req.models.loginusers.findOne({resetPasswordToken:token},function(err,user){
			if(!err){
				console.log('User is ',user);
				bcrypt.genSalt(10,function(err,salt){
					bcrypt.hash(pass1,salt,function(err,hash){
						console.log('hash is ',hash);
						req.models.loginusers.update({resetPasswordToken:token},{password:hash}).exec(function afterwards(err,updated){
							if(!err){
								console.log('Updated is ',updated);
								res.send('Password has been reset');
							}
						})
					})
				})
			}
		})
	}
});

// router.get('/profile',function(req,res){
// 	req.models.loginusers.findOne({email:req.body.email},function(err,user){
// 		if(!err){
// 			res.render('profile',{user:user});
// 		}else{
// 			res.send('Please Sign Up');
// 		}
// 	})
// })
router.get('/facebook', nocache,function(req,res){
	console.log('In index page authentication is ',req.isAuthenticated());
	if(req.isAuthenticated()){
		console.log('Facebbok Req user  is ',req.user);
		res.render('facebook',{ user: req.user });
	}
	if(req.isAuthenticated() === false){
		res.render('login');
	}
	
});
router.get('/google',function(req,res){
	console.log("For Google plus req is ",req.user);
	res.render('google',{user:req.user});
})
router.get('/twitter',nocache,function(req,res){
	console.log("For twitter req is ",req.user);
	res.render('twitter',{user:req.user});
});
router.get('/auth/google',passport.authenticate('google',{scope:['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/errgoogle'}),function(req,res){
	res.redirect('/google');
})
router.get('/auth/twitter',passport.authenticate('twitter'));
router.get('/auth/twitter/callback',passport.authenticate('twitter',{failureRedirect:'/errtwitter'}),function(req,res){
	res.redirect('/twitter');
})
router.get('/auth/facebook',passport.authenticate('facebook',{scope:['email']}),function(req,res){

});
router.get('/auth/facebook/callback',passport.authenticate('facebook',{failureRedirect:'/errfacebook'}),function(req,res){
	res.redirect('/facebook');
})
router.get('/login',function(req,res,next){
	res.render('login');
});
router.post('/loginn',passport.authenticate('local',{failureRedirect:'/loginFailure'}),function(req,res){
	res.redirect('/');
});
router.get('/logout',function(req,res){
	req.logOut();
	// res.send('logged out',401);
	// res.status(401).send('logged out');
	req.session.destroy(function(err){
		console.log('Session destroyed');

		res.redirect('/login');
	});
	console.log('Session is ',req.session);
});
// router.post('/loginn',function(req,res){
// 	var data= req.body;
// 	console.log(data);
// 	// console.log(req.models);
// 	createuser(data,req,res);
// })
router.get('/loginFailure',function(req,res,next){
	res.render('loginfailure');
	// res.send('Failed to authenticate');
});
router.get('/loginSuccess',function(req,res,next){
	res.send('Successfully authenticated');
});
router.get('/edit/:id',function(req,res,next){
	console.log('About to be edited ',req.params.id);
	req.models.loginusers.findOne({id:req.params.id}).exec(function(err,found){
		if(found){
			res.render('edit',{edit:found});
		}
	});
});
router.post('/edit/:id',function(req,res){
	console.log('It has been posted');
	console.log(req.params.id);
	console.log(req.body);
	req.models.loginusers.update({id:req.params.id},{username:req.body.username,bio:req.body.bio}).exec(function afterwards(err,updated){
		if(err){
			res.send('Error updating user');
		}else{
			res.send('It has been succesfully updated');
		}
	})
})
router.post('/search',function(req,res){
	console.log('Body is ',req.body);
	console.log('The session is ',req.user);
	var search = req.body.search;
	console.log('the search is ',search);
	req.models.loginusers.findOne({username:search}).exec(function(err,found){
		var that = found;
		console.log('Found is ',found);
		if (found === undefined){
			res.render('searcherror');
		}else{
			req.models.userfollower.count({user:found.id}).exec(function countCB(err,foundcount){
				that.foundcount = foundcount;
				req.models.userfollower.count({follower:found.id}).exec(function followerCB(err,followercount){
					that.followercount=followercount;
					console.log('It has been counted ',that);
					res.render('search',{users:that});
				})
				
			})	
		}
	})
	// req.models.loginusers.find({username:search}).exec(function(err,users){
	// 	if(users.length === 0){
	// 		res.render('searcherror')
	// 	}else{
	// 		res.render('search',{users:users});
	// 		// console.log('Users are ',users);
	// 		// res.json(users);
	// 	}
	// })
});
router.post('/follow/:id',function(req,res){
	// console.log('In the follow');
	console.log('The session is ',req.user);
	console.log('The request body is ',req.body);
	console.log('The person being foloowed is ',req.body.id);
	var body = {};
	body.user = req.user.id;
	var idd = parseInt(req.body.id);
	body.follower = idd;
	console.log('Body is',body);
	followuser(body,req,res);
	// if(!req.user){
	// 	res.send("Session is invalid. Please navigate to the Login route.");
	// }else{
	// 	followuser(body,req,res);
	// }
});
var followuser = function(data,req,res){
	// req.models.find({id:data.user}).populate('userFollowing').exec(function(e,r){
	// 	if(e){
	// 		console.log(e)
	// 	}else{
	// 		r[0].userFollowing.add(data.user);
	// 		r[0].save(function(err,res){
	// 			if(!err){
	// 				res.send('You have successfully followed the user');
	// 			}
	// 			else{
	// 				console.log(err);
	// 			}
	// 		})
	// 	}
	// })
	req.models.userfollower.create(data,function(err,created){
		if(!err){
			res.send('You have successfully followed the user');
		}else{
			console.log(err);
			res.send({error: true, message: 'There is a problem somewhere'});
		}
	})
}
var createuser = function(data,req,res){
	req.models.loginusers.create(data,function(err,user){
		if (!err){
			res.send(data.username + " You have successfully been registered");
		}else{
			console.log(err);
			res.send({error: true, message: 'There is a problem somewhere'});
		}
	})
}

module.exports = router;
