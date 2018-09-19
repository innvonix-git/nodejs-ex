
//app/models/user.js
//load the things we need
var mongoose = require('mongoose');

//define the schema for our user model
var userSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },	
	property_name: String,
	address1: String,
	address2: String,
	category_id: [Number], 
	property_desc: String,
	property_images: String,
	user_id: Number,
	created_by: Number,
	status: Number,
	post_code: String,
	city: String,
	country: String,
	is_claimed: Number,
	created_date: String,
	updated_date: String,
	property_id:String
});


//create the model for users and expose it to our app
module.exports = mongoose.model('properties', userSchema);