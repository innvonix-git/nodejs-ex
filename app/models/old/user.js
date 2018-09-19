//app/models/user.js
//load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//define the schema for our user model
var userSchema = mongoose.Schema({	
	id:{ type: Number, default: 1 },
	first_name: String,
	last_name: String,
	mail: String,
	password: String,
	contact_number: Number,
	address1: String,
	address2: String,
	city: String,
	country: String,
	postcode: String,
	ip_address: String,
	status: Number,
	user_type: Number,
	business_name: String, 
	business_name: String,
	created_date: String,
	updated_date: String,
	active_hash: String,
	forgot_hash: String,
	forgot_hash_date: String
});


//methods ======================
//generating a hash
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

//create the model for users and expose it to our app
module.exports = mongoose.model('users', userSchema);
