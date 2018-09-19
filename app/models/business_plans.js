var mongoose = require('mongoose');

var businessPlansSchema = mongoose.Schema({	
	id: Number,
	amount: Number,
	currency: String,
	title: String,
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('business_plans', businessPlansSchema);