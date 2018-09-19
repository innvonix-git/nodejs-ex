var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var flaggedReviewSchema = mongoose.Schema({	
	id: Number,
	property_id: Number,
	review_id: Number,
	user_id: Number,
	status: Number,
	created_date: String
});

module.exports = mongoose.model('flagged_review', flaggedReviewSchema);