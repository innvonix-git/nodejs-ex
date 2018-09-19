var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var thumb 		= require('node-thumbnail').thumb;
var models      = require('../../app/models/revstance_models');
var Property    = models.Property;
var Category    = models.Category;
var Review      = models.Review;
var User 		= models.User;
var Claims 		= models.Claim;
var FlaggedReview= models.Flag;
var fs  		= require('fs');
var randomstring= require("randomstring");
var slugify = require('slugify');

exports.isLoggedIn = function(req, res, next){
	if (req.session.user && req.session.user.user_type==2) { // req.session.passport._id
		next();
	} else {
		res.redirect('/');
	}
}

exports.userCheck = function(req, res, next){
	if (req.session.user) {
		next();
	} else {
		res.redirect('/');
	}
}

exports.showBusinessHomePage = function(req, res) {
	res.render('listing/businesshome.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session
	 });	 
}

exports.claimProperty = function(req, res) {
	if(req.session.user){
		if(req.session.user.user_type==2){
			if(req.query.id){
				Property.findOne({id:req.query.id}, function(err, property){
					if(err){
						req.flash('error', 'Invalid param in location claim');
						res.redirect('/errorpage');
					}
					if(property==null){
						req.flash('error', 'Invalid param in location claim');
						res.redirect('/errorpage');
					}
					Claims.find({user:req.session.user.id, property:req.query.id}, function(err, data){
						if(err){
							req.flash('error', 'Something is wrong');
							res.redirect('/errorpage');		
						}
						console.log(data);
						if(data.length>0){							
							req.flash('success', 'Location already claimed');
							res.redirect('/myclaimedlocations');
						}else{
						Claims.find().sort([['id', 'descending']]).limit(1).exec(function(err, data) {
						if(err){
							console.log(err);	
						}
						var claim = new Claims();
						if(data==null){
						claim.id=1;							
						}else if(data.length==0){
						claim.id=1;
						}else{
							claim.id=data[0].id+1;
						}
						claim.user=req.session.user.id;
						claim.property=req.query.id;
						claim.status = 0;
						claim.created_date=getDate();
						claim.save(function(err){
							if(err){
								req.flash('error', 'Claim failed');
								res.redirect('/errorpage');
							}
							req.flash('success', 'Location claimed successfully');
							res.redirect('/myclaimedlocations');
						});
					});
					}
					});
				});
			}
		}
	}
}

exports.unclaimProperty = function(req, res) {
	if(req.session.user){
		if(req.session.user.user_type==2){
			if(req.query.id){
				Claims.find({user: req.session.user.id, id:req.query.id}).remove().exec(function(err){
					if(err){
						req.flash('error', 'Claim failed');
						res.redirect('/errorpage');
					}
					req.flash('success', 'Location unclaimed successfully');
					res.redirect('myclaimedlocations');
				});
			}
		}
	}
}

exports.showMyListingPage = async function(req, res) {
	var UserId = req.session.user.id;
	var keyword='';
	var category='';
	if(req.query.keyword)
	{
		keyword=req.query.keyword.trim().toLowerCase();
	}
	if(req.query.category)
	{
		category=req.query.category;
	}	
	var filter={};
	var claimStatus = 0;
	var otherClaimStatus = 0;
	var searchedProperties = [];
	var page = 0;
	var skip = 0;
	var perpage = 5;
	var counter = 0;
	var categoriesList = [];
	var categoriesListToSearch = [];
	var propertyList = [];
	filter.keyword=keyword;
	filter.category=category;	

	if(req.query.page){
		if(IsNumeric(req.query.page)){
			page = req.query.page;
		}else{
			req.flash('error', 'Invalid param page in Location search');
			res.redirect('/errorpage');
		}
	}

	if(req.query.category){
		filter.category_filter=req.query.category;
		categoriesListToSearch.push(parseInt(req.query.category));
	}else{
		var categories = await Category.find();
		categories.forEach(function(category) {
		categoriesListToSearch.push(parseInt(category.id));
	}); 
	}
	//console.log(categoriesListToSearch);

	console.log(categoriesListToSearch);
	//Get Claim Data
	var claimDataProperies = [];
	var claimData = await Claims.find();
	claimData.forEach(function(claim){
		claimDataProperies.push(claim.property);
	})
	
   //Get Categories Data
   var categories = await Category.find();
	categories.forEach(function(category) {
		categoriesList[category.id]=category;
	}); 
	
	//Get Properties with User, Category and Reviews
	let properties = await Property.find({$and:  [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},
		{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },
		{post_code: { "$regex": keyword, "$options": "i" }} ]}, {user:req.session.user._id}, 
		{category_id: { $in: categoriesListToSearch }}]}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail'}).populate({path: 'category',
      model: 'Category',select: 'category_name id'}).populate({path: 'reviews',
      model: 'Review'}).limit(perpage).skip(skip)
    .sort({ property_name: 'asc'}).exec();

   let propertyCount = await Property.find({$and:  [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},
		{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },
		{post_code: { "$regex": keyword, "$options": "i" }}]}, {user:req.session.user._id},
		{category_id: { $in: categoriesListToSearch }}]}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail'}).populate({path: 'category',
      model: 'Category',select: 'category_name id'}).populate({path: 'category',
      model: 'Review'}).limit(perpage).skip(skip)
    .sort({ property_name: 'asc'}).count().exec();
	console.log(propertyCount);

	counter = propertyCount;
	console.log("Count "+counter);

	console.log("Properties"+properties);
	
	properties.forEach(function(property) {
		var propertyItem = {};
		propertyItem.id = property.id;
		propertyItem.property_name = property.property_name;
		propertyItem.category = getCategoryName(property.category_id, categoriesList);
		propertyItem.user = property.user;
		propertyItem.property_image = property.property_images;
		propertyItem.property_desc = property.property_desc;
		propertyItem.property_status = property.status;
		propertyItem.address1 = property.address1;
		propertyItem.address2 = property.address2;
		propertyItem.area = property.area;
		propertyItem.post_code = property.post_code;		
		propertyItem.average_rating =  property.average_rating;		
		propertyItem.review_count = property.reviews.count;
		propertyItem.slug = property.slug;
		propertyItem.is_claimed = checkIsClaimedProperty(property.id, claimDataProperies);
		searchedProperties.push(propertyItem);
    });
		res.render('listing/myListing', {
			error : req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			properties: searchedProperties,
			categories: categoriesList,
			keyword: keyword,
			filters: filter,
			page: page,
			perpage: perpage,			
			counter: counter,
		});	
    /*  
	
	Category.find({}, function(err, categories) {
  		if(err){
	  		req.flash('error', 'Error : something is wrong in property search');
			res.redirect('/errorpage');
  		}  	
  		categories.forEach(function(category) {
  			categoriesList[category.id]=category;
  		}); 		
		Properties.count({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{ area:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, {user_id:req.session.user.id}, categoriesListToSearch]}, function(err, c) {
		counter = c;//
		
		Properties.find({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{ area:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, {user_id:req.session.user.id}, categoriesListToSearch]}).limit(perPage).skip(perPage * page)
    .sort({ property_name: 'asc'}).exec(function(err, properties) {  	
    	if(err){
	  		req.flash('error', 'Error : something is wrong in property search');
			res.redirect('/errorpage');
	  	}
	  	
	  	properties.forEach(function(property) {
	      userIds.push(property.user);
	      propertyIds.push(property.id);
	    });
	    User.find({'id': {$in: userIds } }, function(err, users) {
	    	if(err){
		  		req.flash('error', 'Error : something is wrong in property search');
				res.redirect('/errorpage');
	  		}
	  		users.forEach(function(user){
				usersList[user.id]=user;
	  		});
	  		
	  		Reviews.find({'id':{$in: propertyIds}}, function(err, reviews) {
	  			reviews.forEach(function(review){
	  				reviewsList.push(review);
	  			});
	  				var claimDataProperies = [];
			    	Claims.find({}, function(err, claimData) {
			    		if(err){
			    			req.flash('error', 'Error : something is wrong in property search');
							res.redirect('/errorpage');
			    		}
			    		claimData.forEach(function(claim){
			    			claimDataProperies.push(claim.property);
			    		})
	  					properties.forEach(function(property) {
		  					var propertyItem = {};
		  					propertyItem.id = property.id;
		  					propertyItem.property_name = property.property_name;
		  					propertyItem.category = getCategoryName(property.category,categoriesList);
		  					propertyItem.user = property.user;
		  					propertyItem.property_image = property.property_images;
		  					propertyItem.property_desc = property.property_desc;
		  					propertyItem.property_status = property.status;
		  					propertyItem.address1 = property.address1;
		  					propertyItem.address2 = property.address2;
		  					propertyItem.area = property.area;
		  					propertyItem.post_code = property.post_code;
		  					propertyItem.review_count = getPropertyReviewCount(property.id, reviewsList);
		  					propertyItem.average_rating = getPropertyAverageRating(property.id, reviewsList);
		  					propertyItem.is_claimed = checkIsClaimedProperty(property.id, claimDataProperies);
		  					searchedProperties.push(propertyItem);
					    });
					    res.render('listing/myListing', {
							error : req.flash("error"),
							success: req.flash("success"),
							session: req.session,
							properties: searchedProperties,
							categories: categoriesList,
							keyword: keyword,
							filters: filter,
							page: page,
							counter: counter,
						});					
				  	});
				});
			});
		});
	});
});*/
}

function checkIsClaimedProperty(id, list){
		list.forEach(function(nid){
			if(id==nid) return true;
		});
		return false;
}

exports.postReplyPage = function(req, res) {
	console.log(req.body);
	Review.find({'id': req.body.reply_reviewid,'property_id':req.body.propertyId},function(err,review){
		if(err){
			res.send({'status':false});
		}else{
			var day = getDate();
			if(review){
        	Review.updateOne({'id': req.body.reply_reviewid,'property_id':req.body.propertyId},{ $set:{'is_reply': 1,reply_text:req.body.review_reply,reply_created_date:day}},function(err,done){
            	if (err){
            		res.send({'status':false});
            	}
				res.send({'status':true});
              });
    		}
		}
	})
}

function getCategoryName(id, catList) {
	let category_id = id;
	let catname = [];
	catList.forEach(function (cat) {
		if (category_id.indexOf(cat.id.toString()) == -1) {
			//console.log("Not found");
		} else {
			catname.push(cat.category_name);
		}
	});
	return catname.join(", ");
}

exports.showPropertyListingPage = function(req, res) {
	var id = req.param('property');
	console.log('propery_id'+id);
    Properties.find({id:id,user_id: req.session.user.id}, function(err, c) {
    	if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}else{
			var propertyList = [];      
		    c.forEach(function(user) {
		      propertyList.push(user);
			});
			//
			Review.find({property_id:id},function(err,r){
				var reviewsUserIds = [];
				if(err){
					req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
				}else{
						// console.log(id);
					var reviewList = [];      
				    r.forEach(function(rev) {
				      reviewList.push(rev);
				      reviewsUserIds.push(rev.user_id);
					});
					console.log("Review User");
				    console.log(reviewsUserIds);
					var reviewUsersList = [];
					User.find({'id':{ $in: reviewsUserIds }}, function(err, reviewUsers){
						if(err){
							console.log("Errror");
						}
						reviewUsers.forEach(function(ruser){
							reviewUsersList[ruser.id]=ruser;
							console.log(ruser);
						});						
						 res.render('listing/detailListing.ejs', {
						    error : req.flash("error"),
						    success: req.flash("success"),
						    session:req.session,
						    properties: propertyList,
						    reviews: reviewList,
						    reviewUsersList: reviewUsersList,
					    });
					});
				}
			});
		}
 	});     
}

exports.showCreateListingPage = function(req, res) {
	Category.find({status:parseInt(1)}, function(err, c) {
		if(err){
			req.flash('error', 'Error : something is wrong in create listing');
			res.redirect('/errorpage');
		}else{
			var categoryList = [];	    
		    c.forEach(function(user) {
		      categoryList.push(user);
		    });
		    console.log("categories"+categoryList);
		    res.render('listing/addListing.ejs', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session,
				categories: categoryList,
		 	})
		}
	});
}

exports.deletePropertyListingPage = function(req,res){		
	var id = parseInt(req.query.property);
	console.log("PropertyId"+id);
	var userId = req.session.user._id;
	console.log("UserId"+userId);
	Property.findOne({id:id,user: userId}, function(err, property) {
		if(err){
			console.log(err);
			req.flash('success', 'Location deleted failed.');
     		res.redirect('/myListing');
		}
		if(property==null){
			console.log(err);
			req.flash('success', 'Location deleted failed.');
     		res.redirect('/myListing');	
		}
		console.log(property);
		var del_images = property.property_images.split(",");		
		Property.deleteOne({ 'id' :  id}, function(err){
		if((property.property_images.length)!=0){
			for (var i = 0; i < del_images.length; i++) {
				console.log("Image Name :"+del_images[i]);

				if(fs.existsSync('public/uploads/'+del_images[i])){
					fs.unlink('public/uploads/'+del_images[i], (err) => {
					if (err){
					  	console.log('file delete error');
					  }
					  else{
					  	console.log('File deleted!');
					  }
					});
				}

				if(fs.existsSync('public/uploads/thumbs/thumb_'+del_images[i])){
					fs.unlink('public/uploads/thumbs/thumb_'+del_images[i], (err) => {
					if (err){
					  	console.log('file delete error');
					  }else{
						console.log('File deleted!');
					  }
					});
				}
			}
		}		

		/*Claims.deleteMany({ 'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Claims deleted');			
		});

		Review.deleteMany({ 'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Review deleted');			
		});

		FlaggedReview.deleteMany({'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Review deleted');			
		});*/

		User.findOne()
	 	req.flash('success', 'Location deleted successfully');
     	res.redirect('/myListing');
	});	
			
	});
	
}

exports.editPropertyListingPage = async function(req, res) {
	var id = parseInt(req.params.property);
	if(id.length<=0){
		console.log("Location id is not provided");
		req.flash('error', 'Error : something is wrong, location-id is not provided.');
		res.redirect('/errorpage');
	}

	//Get Categories Data
 //    var categories = await Category.find({status:1});
 //    var categoriesList = [];
	// categories.forEach(function(category) {
	// 	categoriesList[category.id]=category;
	// }); 

	let categories = await Category.find({status:1});
		    let categories_list = [];
		    categories.forEach(function(cat){
		    	categories_list.push({"id": cat.id, "category_name": cat.category_name, "_id": cat._id});
		    });
	
	//console.log(categoriesList);
    PropertyData = await Property.find({id:id, user: req.session.user._id});
    //console.log(PropertyData);
   		res.render('listing/editListing.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			properties: PropertyData,
			categories: categories_list,
	 	})	
}

exports.storePropertyListing = async function(req, res) {
	if(req.body.property_name.length!=0 && req.body.categories!=undefined){
	let getProperty = await Property.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),
		address1: new RegExp('^' +req.body.address1.trim() + '$', 'i'),		
		area: new RegExp('^' +req.body.area.trim() + '$', 'i'),
		post_code: new RegExp('^' +req.body.postcode.trim() + '$', 'i')}).exec();
		var slug = slugify(req.body.property_name.trim());
		slug = slug+"-"+randomstring.generate(5);
	if(getProperty.length>0){
		req.flash('error','Error : This location is already exist');
		res.redirect('/addListing');

		uploaded = req.files.map(function(value) {
			return value.filename;
		});

		uploaded_files = uploaded.join();
		var arr = uploaded_files.split(',');
		for (var i = 0; i < arr.length; i++) {
			//console.log('public/uploads/'+arr[i]);
			if(fs.existsSync('public/uploads/'+arr[i])){
			    fs.unlink('public/uploads/'+arr[i], (err) => {
				  if (err){
				  	console.log('File delete error');
				  }else{
				  	console.log('File deleted!');
				  }
				});
			}
		}		
	}else{

		if(req.files && (req.files.length<=10)){
		    var uploaded_files;

		    uploaded = req.files.map(function(value) {
				return value.filename;
			});
			uploaded_files = uploaded.join();

			uploaded.map(function(a){
				generateThumb('public/uploads/'+a, '345px', 'thumb_', 'public/uploads/thumbs');
			});

		    //console.log(uploaded_files);
		    let categories = await Category.find({_id: req.body.categories});
		    let categories_ids = [];
		    categories.forEach(function(cat){
		    	categories_ids.push(cat.id);
		    });
		    
		    let properties = await Property.find().sort([['id', 'descending']]).limit(1).exec();
		    
		    properties.forEach(function (propertydata) {
		    	var newProperty = new Property();
				var day = getDate();
		    if(propertydata){		    	
		    	newProperty.id = propertydata.id+1;
		    }else{
		    	newProperty.id = 1;
		    }		    
			newProperty.property_name = req.body.property_name.trim();
		    newProperty.address1 = req.body.address1.trim();
		    newProperty.address2 = "";
		    newProperty.slug = slug;
		    newProperty.business_key = randomstring.generate(12);
		    newProperty.area = req.body.area.trim();
		    newProperty.post_code = req.body.postcode;
			newProperty.category = req.body.categories;
			newProperty.category_id = categories_ids;
		    newProperty.property_desc = req.body.property_desc;
		    newProperty.property_images = uploaded_files;
		    newProperty.city = req.body.city;
		    newProperty.country = req.body.country;
		    newProperty.user = req.session.user._id;
		    newProperty.user_id = req.session.user.id;
		    newProperty.created_by = req.session.user.user_type;
		    newProperty.status = 0;
		    newProperty.is_claimed = 0;
		    newProperty.created_date = day;
		    newProperty.updated_date = day;
		    
			    newProperty.save(function(err) {
			        if(err){
						req.flash('error', 'Error : something is wrong while add business user');
						res.redirect('/errorpage');
					}
					else{
					 	User.findOne({id:req.session.user.id}, function (err, updatePropertyData) {
					 		
							updatePropertyData.property = newProperty._id;
		    				updatePropertyData.category = newProperty.category;
		  
		    				updatePropertyData.save(function (err) {
		    				if(err){
								req.flash('error', 'Error : something is wrong');
								res.redirect('/errorpage');
							}else{
								req.flash('success', 'property added to user data');
							}
						});
		    			});
		    		req.flash('success', 'Location request has been submitted successfully, It would be displayed on the site once the admin approves it');
					res.redirect('/Mylisting');	
					}
		    	});
			});
		}
	}
}
	else{
		//console.log("submit without image upload");
		req.flash('error', 'You can upload maximum 10 images');
		res.redirect('/addListing');
	}	
}	


exports.updatePropertyListing = async function(req, res) {
	var categoryIds = [];

	 let categories = await Category.find({id: req.body.categories});
		let categories_ids = [];
		categories.forEach(function(cat){
		categories_ids.push(cat.id);
	});
		    

	console.log(categories_ids);
	if(req.body.property_name.length!=0 && req.body.categories!=undefined){
		var merge_img;
		var update_merge;
		

	if(req.files){		
		var uploaded_files;
	    uploaded = req.files.map(function(value) {
			return value.filename;
		})

		uploaded.map(function(a){
			generateThumb('public/uploads/'+a, '345px', 'thumb_', 'public/uploads/thumbs');
		})

		uploaded = uploaded.join();
		var uploaded_arr = uploaded.split(",");

		var exist_image =req.body.images;
		if(req.body.images!=undefined){
			var delete_prop_images = exist_image.join();
		}
		
		if(req.body.images==undefined && uploaded_arr.length==1 && uploaded_arr[0]==''){
			merge_img = [];
		}
		else if(uploaded_arr.length==1 && uploaded_arr[0]==''){
			var merge_img = req.body.images;
		}else if(req.body.images==undefined){
			merge_img = uploaded_arr;
		}else{
			merge_img = uploaded_arr.concat(req.body.images);
		}
		update_merge = merge_img.join();		
	}	

	Property.findOne({ 'id' :  parseInt(req.body.property_id) }, function(err, prop) {	
	if(err){
		console.log("error"+err);
		req.flash('error','Error : something is wrong while update Location');
		res.redirect('/errorpage');
	}else{
		if (prop) {		
			var db_property_id	= prop.id;
			var db_property_name = prop.property_name;
			var db_address1 = prop.address1;
			var db_area = prop.area
			var db_category = prop.category;
			var db_categories = prop.category_id;
			var db_post_code = prop.post_code;
			var db_images = prop.property_images.split(",");

			if(req.body.images!=undefined){
				for (var i = 0; i < db_images.length; i++) {
					if((delete_prop_images.indexOf(db_images[i])) == (-1)){
						if(fs.existsSync('public/uploads/'+db_images[i])){
							fs.unlink('public/uploads/'+db_images[i], (err) => {
								if (err){
							  	console.log('file delete error');
							  	}else{
							  	console.log('File deleted!');
							  	}
							});
						}

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_images[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_images[i], (err) => {
							if (err){
							  	console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}
					}
				}
			}
			else{
				if((prop.property_images.length)!=0){
					for (var i = 0; i < db_images.length; i++) {
						if(fs.existsSync('public/uploads/'+db_images[i])){
							fs.unlink('public/uploads/'+db_images[i], (err) => {
							if (err){
								console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_images[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_images[i], (err) => {
								if (err){
									console.log('file delete error');
							  	}else{
									console.log('File deleted!');
							  	}
							});
						}
					}
				}
			}
	
			db_post_code = (typeof(db_post_code) =="undefined") ? "" : db_post_code;
			if(db_post_code.length==0){
				db_post_code = "";
			}			
			var categoryHashIds = [];
			Category.find({'id': {$in:categories_ids}}, function(err, result){
				result.forEach(function(categoryData){
					categoryHashIds.push(categoryData._id);
				});			
			if(db_property_id==parseInt(req.body.property_id) && db_property_name==req.body.property_name.trim() && db_address1==req.body.address1.trim() && db_area==req.body.area.trim() && db_post_code==req.body.postcode.trim())
			{
				Property.findOne({id:parseInt(req.body.property_id)}, function(err, updateProperty) {
					if(err){
						req.flash('success', 'Oops. Something went wrong while update listing');
				        console.log('error');
					}else{
						var day = getDate();
					    updateProperty.property_name = req.body.property_name.trim();
					    updateProperty.address1 = req.body.address1.trim();
					    updateProperty.address2 = "";
					    updateProperty.area = req.body.area.trim();
					    updateProperty.category = categoryHashIds;
					    updateProperty.category_id = categories_ids;
					    updateProperty.property_desc = req.body.property_desc.trim();
					    updateProperty.property_images = update_merge;
					    updateProperty.post_code = req.body.postcode;
					    updateProperty.city = req.body.city;
					    updateProperty.country = req.body.country;
					    updateProperty.updated_date = day;
					    updateProperty.save(function(err) {
			                if (err){
				                req.flash('error', 'Oops. Something went wrong..');
				                console.log('error');
			           		}
		            		else
		            		{				            			
		                		req.flash('success', 'Location updated successfully.');
		                		console.log('same value success');
		                		res.redirect('/myListing');
		                	}
			            });
	            	}
	        	});
			}
			else{				
				Property.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),address1: new RegExp('^' +req.body.address1.trim() + '$', 'i'), post_code: new RegExp('^' +req.body.postcode.trim() + '$', 'i')}, function(err, property) {			 	
				if (property.length>0){
        				req.flash('error', 'Location already exists');
                		res.redirect('/myListing');
        			}
        			else{
        				Property.findOne({id:parseInt(req.body.property_id)}, function(err, updateProperty) {
        					if(err){
								req.flash('success', 'Oops. Something went wrong while update listing');
						        console.log('error');
        					}else{        						
        						var day = getDate();
							    updateProperty.property_name = req.body.property_name.trim();
							    updateProperty.address1 = req.body.address1.trim();
							    updateProperty.address2 = "";
							    updateProperty.area = req.body.area.trim();
							    updateProperty.category = categoryHashIds;
							    updateProperty.category_id = categories_ids;
							    updateProperty.property_desc = req.body.property_desc.trim();
							    updateProperty.property_images = update_merge;
							    updateProperty.updated_date = day;
							    updateProperty.post_code = req.body.postcode;
							    updateProperty.city = req.body.city;
							    updateProperty.country = req.body.country;
							    updateProperty.save(function(err) {
				                if (err){
				                	req.flash('error', 'Oops. Something went wrong..');
				                	res.redirect('/errorpage');
					           	}
				            	else
				            	{
				                	req.flash('success', 'Location updated successfully.');
			                		res.redirect('/myListing');
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
	});
	}
	else{
		req.flash('error', 'Oops. Something went wrong..');
		res.redirect('/myListing');
	}		
}

exports.showClaimPendingProperties = function(req, res) {
	propertyIds = [];
	reviewsList = [];
	claimedProperties = [];
	categoriesList = [];
	propertiesList = [];
	var page=0;
	var counter = 0;
	var perPage = 10;

	if(req.query.page){
		var isnum = /^\d+$/.test(req.query.page);
		if(isnum) page=req.query.page;
	}
	Claims.find({user_id: req.session.user.id}, function(err, claimProperties){		
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		if(claimProperties == null){
			counter =0;
		}else{
			counter = claimProperties.length;
		}
		Claims.find({user_id: req.session.user.id}).limit(perPage).skip(perPage * page).exec(function(err, claimedPropertiesData) {
			claimedPropertiesData.forEach(function(claimproperty){
				propertyIds.push(claimproperty.property_id);
			});	
		console.log("You have Claimed "+claimProperties.length);
		console.log("Property Ids "+propertyIds);
		Property.find({id: {$in: propertyIds } }, function(err, properties) {
	    	if(err){	    		
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
			}

			properties.forEach(function(pr){
				propertiesList[pr.id]=pr;
			});
			Review.find({'property_id': {$in: propertyIds } }, function(err, reviews) {
	  			if(err){
	  				req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
	  			}

	  			reviews.forEach(function(review){
	  				reviewsList.push(review);
	  			});

	  			Category.find({}, function(err, cats) {
			  		if(err){
				  		req.flash('error', 'Error : something is wrong in location search');
						res.redirect('/errorpage');
			  		}
			  		cats.forEach(function(category) {
			  			categoriesList[category.id]=category;
			  		});

	  			claimedPropertiesData.forEach(function(property) {
  					var propertyItem = {};
  					propertyItem.id = property.property_id;
  					propertyItem.claim_id = property.id;
  					propertyItem.property_name = propertiesList[property.property_id].property_name;
  					//propertyItem.category = categoriesList[propertiesList[property.property_id].category_id].category_name;
  					propertyItem.category = getCategoryName(propertiesList[property.property_id].category,categoriesList);
  					propertyItem.user_type = 1
  					propertyItem.user_id = property.user_id;
  					propertyItem.property_image = propertiesList[property.property_id].property_images;
  					propertyItem.property_status = propertiesList[property.property_id].status;
  					propertyItem.address1 = propertiesList[property.property_id].address1;
  					propertyItem.address2 = propertiesList[property.property_id].address2;
  					propertyItem.status = property.status;
  					propertyItem.city = propertiesList[property.property_id].city;
  					propertyItem.country = propertiesList[property.property_id].country;
  					propertyItem.post_code = propertiesList[property.property_id].post_code;
  					propertyItem.review_count = getPropertyReviewCount(property.property_id, reviews);
  					propertyItem.average_rating = getPropertyAverageRating(property.property_id, reviews);				      
  					claimedProperties.push(propertyItem);
  					console.log(propertyItem);	
			    });

				res.render('listing/myPendingClaimProperties.ejs', {
					error : req.flash("error"),
					success: req.flash("success"),
					session: req.session,
					properties: claimedProperties,
					page: page,
					counter: counter
				});
			  });
			});
  		});
		});
	});
}

function getDate(){ 
	return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

function getPropertyAverageRating(id, reviews){
	var counter = 0;
	var totcounter = 0;
	reviews.forEach(function(review){
		if(review.property==id){ counter+=review.review_rating; totcounter++;}
	});
	return isNaN(parseInt(counter/totcounter)) ? 0 : parseInt(counter/totcounter);
}

function getPropertyReviewCount(id, reviews){
	var counter = 0;
	reviews.forEach(function(review){
		if(review.property==id) counter++;
	});
	return counter;
}

function getCategoryName(id,catList){
	var catname = [];
	catList.forEach(function(cat){		
		if(id.indexOf(cat.id.toString()) == -1){
			//console.log("Not found");
		}else{
			catname.push(cat.category_name);		
		}
	});
	return catname.join(", ");
}

function getCategoryId(catList){
	var catid = [];
	catList.forEach(function(cat){		
		if(cat.indexOf(cat.toString()) == -1){
			//console.log("Not found");
		}else{
			catid.push(parseInt(cat.id));		
		}
	});
	return catid.join();
}

function generateThumb(fileName, width, prefix, destinationFolder){

thumb({
  prefix: prefix, 
  suffix: '',
  source: fileName,
  destination: destinationFolder,
  concurrency: 1,
  overwrite: true,
  width:width
}, function (err, stdout, stderr) {
  	if(err) { return false;}else{return true;}
	});
}