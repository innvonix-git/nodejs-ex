
//app/models/user.js
//load the things we need
var mongoose = require('mongoose');

//define the schema for our user model
var userSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },	
	email_type: String,
	email_name: String,
	email_keys: String,
	email_subject: String,
	email_message: String,
	email_status: Number,
	created_date: String,
	updated_date: String,
});


//create the model for users and expose it to our app
module.exports = mongoose.model('email_template', userSchema);