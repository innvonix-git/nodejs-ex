var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var models      = require('../../app/models/revstance_models');
var User = models.User;
var Properties = models.Property;
var Category     = models.Category;
var Reviews      = models.Review;

exports.isLoggedIn = function(req, res, next)
{
	if (req.session.user) { // req.session.passport._id
		next();
	} else {
		res.redirect('/login');
	}
}

exports.addReviewPage = function(req, res) {
	if((req.body.content.trim()).length!=0 && req.body.content!=undefined){
		Reviews.find().sort([['id', 'descending']]).limit(1).exec(function(err, reviewdata) { 
				var start = 1;
				var newReviews = new Reviews();
				var day = getDate();
				newReviews.review_content = req.body.content;
			    newReviews.review_rating = req.body.rating;
			    newReviews.is_reply = 0;
			    newReviews.is_guest = req.body.reviewPostUser;
			    newReviews.user_id = req.session.user.id;
			    newReviews.created_date = day;
			    newReviews.updated_date = day;
			    if(reviewdata.length==0) start=1;
			    else if(reviewdata==null) start=1;
			    newReviews.id = start;
			     newReviews.save(function(err) {
			        if(err){
			        	console.log('error');
						req.flash('error', 'Error : something is wrong while add reviews');
						res.redirect('/errorpage');
					}else{
						console.log('done');
						req.flash('success', 'Reviews added successfully');
				        }
				});

		});
	}
}


exports.showFrontFullListingPage = function(req, res) {
	var id = req.param('property');
	console.log('propery_id'+id);
    Properties.find({id:id}, function(err, c) {
    	if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}else{
			var propertyList = [];      
		    c.forEach(function(user) {
		      propertyList.push(user);
			});
			//
			Reviews.find({property_id:id},function(err,r){
				if(err){
					req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
				}else{
						// console.log(id);
					var reviewList = [];      
				    r.forEach(function(rev) {
				      reviewList.push(rev);
					});
					res.render('frontfulllisting.ejs', {
					    error : req.flash("error"),
					    success: req.flash("success"),
					    session:req.session,
					    properties: propertyList,
					    reviews: reviewList,
				    })
				}
			});
		}
 	});     
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }


    
