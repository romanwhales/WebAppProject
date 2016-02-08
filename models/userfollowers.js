var Waterline = require('waterline');
var User = Waterline.Collection.extend({
	identity:'userfollower',
	connection:'myPostgres',
	migrate:'create',
	attributes:{
		user:{
			model:'loginusers',
		},
		follower:{
			model:'loginusers'
		}
	}
})
module.exports = User;