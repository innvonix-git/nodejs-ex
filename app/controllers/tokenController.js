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
var constants = require('../../config/constants'); 
var dynamicmail  = require('../../app/controllers/dynamicMailController');

exports.getProRatedToken = function(data){	
	var membership_cost = data.membership_cost;
	var current_date = getShortDate().toLocaleString("en-US", {timeZone: "Europe/London"});
	var month_last_date = monthLastDay();
	var total_days = getDateDifferent(current_date,month_last_date);
	var prodata_token = ((total_days * membership_cost)/ 30);
	return token = Math.round(prodata_token);
}
exports.issueToken = function(data){
	console.log(data);
	var receiver_id = data.receiver;  //who receives token
	var sender_id = data.sender;  //who sends token
	var amount = data.amount;  //amount of token
	var operation = data.operation;  //plus or minus
	var transaction_type = data.type;  //token or point
	var description = data.description; //description

	User.findOne({_id:sender_id}, function(err, admindata) {
		var admin_token = admindata.token_balance;
		admindata.token_balance = parseInt(admindata.token_balance) - parseInt(amount);

		admindata.save(function(err){
			if(err){
				req.flash('error', 'could not find admin');
				res.redirect('/errorpage');
			}
			else{
				User.findOne({_id:receiver_id}, function(err, userdata) {
					if(transaction_type == 1){
					var user_token = userdata.token_balance;
					userdata.token_balance = parseInt(userdata.token_balance) + parseInt(amount);
					}else{
						var user_point = userdata.point_balance;
						userdata.point_balance = parseInt(userdata.point_balance) + parseInt(amount);
					}
					userdata.save(function(err){
					if (err){
		    			req.flash('error', 'Could not find User');
		    			res.redirect('/errorpage');
					}
					else {
						TokenLog.find().sort([['id', 'descending']]).limit(1).exec(function(err, tokenlog) {

							if(err){
								res.send({'status':false,'backurl':req.originalUrl});
							}
							var newTokenlog = new TokenLog();
							var day = getDate();
		    				if(tokenlog.length==0)
		   						newTokenlog.id = 1;
							else
								newTokenlog.id = tokenlog[0].id+1;
		    				newTokenlog.user = receiver_id;
		    				newTokenlog.from = sender_id;
		    				newTokenlog.token_amount = amount;
		    				newTokenlog.operation = operation;
		    				newTokenlog.description = description;
		    				newTokenlog.type = transaction_type;    
		    				newTokenlog.status = 1;
		    				//newTokenlog.created_date = day;
		    				
		    				newTokenlog.save(function(err) {
		    					if(err){
		    						console.log("error");
		    					}
		    					else{
		    						console.log("success");
		    						//res.send({'status':true,'backurl':req.originalUrl});
		    					}
		    				});
						});
					}
					});
				});
			}
		});
	});	
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function getShortDate(){ var d = new Date(); return d.getFullYear()+ '/'+addZero(d.getMonth()+1)+'/'+addZero(d.getDate()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

function monthLastDay() {
  	var date = new Date(), y = date.getFullYear(), m = date.getMonth();
	var lastDay = new Date(y, m + 1, 0);
	return lastDay.getFullYear()+ '/'+addZero(lastDay.getMonth()+1)+'/'+addZero(lastDay.getDate());  	
}

function getDateDifferent(from,to){ 
    var from = new Date(from);
	var to = new Date(to);
	var timeDiff = Math.abs(to.getTime() - from.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))+1;
	return diffDays;
}