var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var likeSchema = mongoose.Schema({	
	id: Number,
	review_id: Number,
	property_id: Number,
	user_id: String,
	status: Number,
	created_date: String
});

module.exports = mongoose.model('like', likeSchema);