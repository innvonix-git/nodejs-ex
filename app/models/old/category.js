var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var categorySchema = mongoose.Schema({	
	id: Number,
	category_name: String,
	status: Number,
	created_date: String,
	updated_date: String	
});

module.exports = mongoose.model('category', categorySchema);