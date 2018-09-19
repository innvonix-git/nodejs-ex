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

function getShortDate() {
	var d = new Date();
	return addZero(d.getMonth()+1) + '/' + addZero(d.getDate()) + '/' +  d.getFullYear();
}

function getDatewithTime() {
	var d = new Date();
	return addZero(d.getMonth()+1) + '/' + addZero(d.getDate()) + '/' +  d.getFullYear() +' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds());
}

function getDatefromDatabase(date){
	var newDate = moment(date, "YYYY-MM-DD").format("MM/DD/YYYY");
	return newDate;
}

function getDatefromFrontEnd(date){
	var newDate1 = moment(date, "DD/MM/YYYY").format("MM/DD/YYYY");
	return newDate1;
}

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }
