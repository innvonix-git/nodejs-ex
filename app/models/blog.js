
//app/models/user.js
//load the things we need
var mongoose = require('mongoose');

//define the schema for our user model
var blogSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },	
	blog_title: String,
	blog_content: String,
	blog_image: String,
	created_date: String,
	updated_date: String,
});

//create the model for users and expose it to our app
module.exports = mongoose.model('blogs', blogSchema);