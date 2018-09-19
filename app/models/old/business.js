var mongoose = require('mongoose');
//var bcrypt   = require('bcrypt-nodejs');

var businessSchema = mongoose.Schema({
	id:{ type: Number },
	business_name: String,
	user_id: Number,
	address1: String,
	address2: String,
	contact_number: String,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('businesses', businessSchema);