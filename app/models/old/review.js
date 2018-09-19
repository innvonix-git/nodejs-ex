var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var reviewSchema = mongoose.Schema({	
	id: Number,
	property_id: Number,
	user_id: Number,
	review_content: String,
	review_media: String,
	review_rating: Number,
	is_reply: Number,
	is_guest: Number,
	reply_text: String,
	status: Number,
	ip_address: String,
	user_location: String,
	timestamp: Number,
	created_date: String,
	reply_created_date:String,
	updated_date: String
});

module.exports = mongoose.model('review', reviewSchema);