var mongoose = require('mongoose');
//var bcrypt   = require('bcrypt-nodejs');

var claimSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },
	property_id: Number,
	user_id: Number,
	status: Number,
	created_date: String	
});

module.exports = mongoose.model('claims', claimSchema);