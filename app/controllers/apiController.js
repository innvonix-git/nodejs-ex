var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var models      = require('../../app/models/revstance_models');
var Property 	= models.Property;
var Category    = models.Category;
var Reviews		= models.Review;
var User 		= models.User;
var http		= require('http');
var url 		= require('url') ;
exports.getProperty = function(req, res) {
	var propertyDetails = {};
	var response = {};
	var userIds = [];
	var conditions = {};
	var avg_review_rating = 0;
	console.log()
	conditions.property_id = req.body.id;
	if(!req.body.email){
			response.success=false;
			response.message="Revstance user details not provided";			
			res.send(response);
	}else{
		User.find({mail:req.body.email}, function(err, user) {
			if(err){
				response.success=false;
				response.message="Something went wrong (user retrive error)";res.send(response);
			}else if(user==null){
				response.success=false;
				response.message="No user found";res.send(response);
			}else if(user.length<1){
				response.success=false;
				response.message="No user found";res.send(response);
			}else{
				console.log(user.id);
				Property.findOne({property_id: conditions.property_id, user_id: user[0].id}, function(err, property) {
				if (err){
					response.success=false;
					response.message="Something went wrong (get property)";res.send(response);
				}else if(property==null){
					response.success=false;
					response.message="Something went wrong (not getting any property)";	res.send(response);
				}else if(property.length<1){
					response.success=true;
					response.message="No location found";res.send(response);
				}else{
					Category.find({id:property.category_id}, function(err, category) {
					if (err){
						response.success=false;
						response.message="Something went wrong (get category)";res.send(response);
					}else{
						userIds.push(property.user_id);			
						Reviews.find({property_id: property.id}, function(err, allReviews) {
							if (err){
								response.success=false;
								response.message="Something went wrong (get review)";
							}else{					
									var review_types = {one:0, two:0, three:0, four:0, five:0};							
									var i=0;
									allReviews.forEach(function(review){
										avg_review_rating+=review.review_rating;
										if(review.review_rating==1)	review_types.one++;
										else if(review.review_rating==2) review_types.two++;
										else if(review.review_rating==3) review_types.three++;
										else if(review.review_rating==4) review_types.four++;
										else if(review.review_rating==5) review_types.five++;
									});
									propertyDetails.id = property.property_id;
									propertyDetails.property_name = property.property_name;
									propertyDetails.address1 = property.address1;
									propertyDetails.address2 = property.address2;
									propertyDetails.review_count = allReviews.length;
									propertyDetails.property_desc = property.property_desc;		
									propertyDetails.created_date = property.created_date;
									propertyDetails.property_images = property.property_images;
									propertyDetails.category_id = category.category_name;		
									propertyDetails.review = review_types;
									propertyDetails.url = req.headers.host+'/location/location-details?id='+property.id;
									if((avg_review_rating / allReviews.length)==null)
										propertyDetails.avg_review_rating = 0;
									else
									propertyDetails.avg_review_rating = avg_review_rating / allReviews.length;
									//console.log(propertyDetails);
									response.success= true;
									response.message = "Location retrived.";
									response.data = propertyDetails;
									res.send(response);
								}	
							});
						}
					});	
				}
			});
			}
		});
	}
}