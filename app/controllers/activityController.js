var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var thumb 		= require('node-thumbnail').thumb;
var models      = require('../../app/models/revstance_models');
var User 		= models.User;
var Property 	= models.Property;
var Category    = models.Category;
var Review 		= models.Review;
var TokenLog    = models.TokenLog;
var Claims 		= models.Claim;
var FlaggedReview= models.Flag;
var Like   	     = models.Like;
var Membership   = models.Membership;
var RecentActivity = models.RecentActivity;
var constants = require('../../config/constants'); 
var dynamicmail  = require('../../app/controllers/dynamicMailController');

exports.storeRecentActivity = function(data){
	console.log(data);
	var user = data.user;//user who adds location
	var description = data.description;//description of recent activity
	var property = data.property;//property id of location which user added
	var target_user = data.target_user;//Id of user which you recently followed
	var review = data.review;//Id of user which you recently followed

	RecentActivity.find().sort([['id', 'descending']]).limit(1).exec(function(err, activities) { 

		if(err){
			req.flash('error', 'No recent activities');
			res.redirect('/errorpage');
		}
		var newActivity = new RecentActivity();
		var day = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
		if(activities.length==0)
		   	newActivity.id = 1;
		else
			newActivity.id = activities[0].id+1;
		newActivity.activity_type = parseInt(data.activity_type);
		newActivity.user = user;
		newActivity.description = description;
		newActivity.property = property;
		newActivity.review = review;
		newActivity.target_user = target_user;
		newActivity.status = parseInt(1);
		newActivity.created_date = day;
		newActivity.updated_date = day;

		newActivity.save(function(err){
			if(err){
				console.log(err);
			}
			else{
				console.log("Success");
			}
		});
	});
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function getShortDate(){ var d = new Date(); return d.getFullYear()+ '/'+addZero(d.getMonth()+1)+'/'+addZero(d.getDate()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }