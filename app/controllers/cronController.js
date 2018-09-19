var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var moment = require('moment');
var thumb 		= require('node-thumbnail').thumb;
var models      = require('../../app/models/revstance_models');
var User 		= models.User;
var Property 	= models.Property;
var Category    = models.Category;
var Review 		= models.Review;
var Claims 		= models.Claim;
var FlaggedReview= models.Flag;
var Like   	     = models.Like;
var Follower 	 = models.Follower;
var Membership   = models.Membership;
var constants = require('../../config/constants'); 
var CroneController  = require('../../app/controllers/cronController');
var dynamicmail  = require('../../app/controllers/dynamicMailController');
var tokenallocate   = require('../../app/controllers/tokenController');

exports.setUserMembership = async function(){	
	var current_date = getShortDate().toLocaleString("en-US", {timeZone: "Europe/London"});
	console.log(current_date);
	var users = await User.find({user_type:1,next_billing_cycle:current_date}).populate({path: 'membership',model: 'Membership',select: 'membership_title id'}).exec();
	users.forEach(function(user){
		console.log(user.first_name);
		console.log(user.membership);
		var token_balance = user.token_balance;
		console.log(token_balance);
	})
}

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

function getDate(){ 
	return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

function getShortDate(){ var d = new Date(); return d.getFullYear()+ '/'+addZero(d.getMonth()+1)+'/'+addZero(d.getDate()); } 

function getNextmonthFirstDay() {
  	var date = new Date(), y = date.getFullYear(), m = date.getMonth();
	var lastDay = new Date(y, m + 1, 1);
	return lastDay.getFullYear()+ '/'+addZero(lastDay.getMonth()+1)+'/'+addZero(lastDay.getDate());  	
}

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }   


