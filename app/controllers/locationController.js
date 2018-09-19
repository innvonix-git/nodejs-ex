var numeral 		= require('numeral');
var bcrypt 			= require('bcrypt-nodejs');
var dateFormat 		= require('dateformat');
var mongoose 		= require ('mongoose');
var moment 			= require('moment');
var models      	= require('../../app/models/revstance_models');
var dynamicmail  	= require('../../app/controllers/dynamicMailController');
var tokenallocate   = require('../../app/controllers/tokenController');
var activities 		= require('../../app/controllers/activityController');

var User 			= models.User;
var Category 		= models.Category;
var Property 		= models.Property;
var Reviews  		= models.Review;
var Claim 	 		= models.Claim;
var RecentActivity  = models.RecentActivity;
var ReportFlag   	= models.ReportFlag;

exports.getDetailLocation = function(req, res){
	var propertyDetails = {}; 
	var cat_array = [];
	var perPage = 5;
	var claimStatus = 0;
	if(req.query.page){
		page=req.query.page;
	}else{
		page=0;
	}
	conditions = {};			
	conditions['property_id']=req.query.id;	
	//console.log(req.query.id);
	Property.findOne({id:req.query.id}, function(err, property) {
		if (err){
			req.flash('error', 'Could not find location');
			res.redirect('/admin/locations');
		}
		//console.log(property);		
		if(req.query.page){
			page=req.query.page;
		}
		propertyDetails.id = req.query.id; 
		propertyDetails.property_name = property.property_name;
		propertyDetails.address1 = property.address1;
		propertyDetails.address2 = property.address2;
		propertyDetails.city = property.city;
		propertyDetails.country = property.country;
		propertyDetails.property_desc = property.property_desc;
		propertyDetails.user_id = property.user_id;
		propertyDetails.status = property.status;
		propertyDetails.created_date = property.created_date;
		propertyDetails.property_images = property.property_images;
		propertyDetails.property_images_count = property.property_images.split(',').length;
		propertyDetails.category_id = property.category_id;
		propertyDetails.post_code = property.post_code;
		console.log("Current property catid "+property.category_id);
		
		cat_array = (property.category_id).map(function(item) {
		    return parseInt(item, 10);
		});

		console.log(cat_array);

		Category.find({id: { $in: cat_array}}, function(err, category) {
		//Category.find({id:property.category_id}, function(err, category) {
			if (err){
				req.flash('error', 'Could not find Category for selected location');
				res.redirect('/admin/locations');
			}
			console.log("category"+category);
			userIds = [];
			userIds.push(property.user_id);			
			Reviews.find(conditions).limit(perPage).skip(perPage * page).exec(function(err, propertyReview) {
		    	if(err){
			  		req.flash('error', 'Error : something is wrong in property search');
					res.redirect('/errorpage');
			  	}
			  	console.log("Paginate Reviews "+propertyReview.length);
		  		Reviews.find(conditions, function(err, allReviews) {
					if (err){
						req.flash('error', 'review fetching error for selected location');
						res.redirect('/admin/locations');
					}
					//console.log("Total Reviews Counter"+c);
					reviewCount = allReviews.length;
					propertyDetails.reviews=[];
					propertyReview.forEach(function(review){							
						userIds.push(review.user_id);
					});
					console.log(userIds);
					User.find({'id':{ $in: userIds }}, function(err,users){
						if (err){
							req.flash('error', 'property and review users fetching error for selected location');
							res.redirect('/admin/locations');
						}
						var usersList=[];
						users.forEach(function(user){
							usersList[user.id]=user;
						});
						propertyDetails.user_type = usersList[propertyDetails.user_id].user_type;
						propertyDetails.user_status = usersList[propertyDetails.user_id].status;
						propertyDetails.contact_number = usersList[propertyDetails.user_id].contact_number;
						propertyDetails.first_name = usersList[propertyDetails.user_id].first_name;
						propertyDetails.last_name = usersList[propertyDetails.user_id].last_name;
						propertyDetails.mail = usersList[propertyDetails.user_id].mail;
						propertyDetails.total_reviews = reviewCount;
						var avg_review_rating = 0;
						var review_types = {one:0, two:0, three:0, four:0, five:0};							
						var i=0;
						console.log("Total Reviews User Counter"+users.length);
						//console.log(propertyReview);
						allReviews.forEach(function(review){
							avg_review_rating+=review.review_rating;
							if(review.review_rating==1)	review_types.one++;
							else if(review.review_rating==2) review_types.two++;
							else if(review.review_rating==3) review_types.three++;
							else if(review.review_rating==4) review_types.four++;
							else if(review.review_rating==5) review_types.five++;
						});
						console.log(review_types);

						propertyReview.forEach(function(review){
							propertyDetails.reviews[i]=review;
							propertyDetails.reviews[i]["first_name"]=usersList[review.user_id].first_name;
							propertyDetails.reviews[i]["last_name"]=usersList[review.user_id].last_name;
							i++;
						});												
						console.log(propertyDetails);
						propertyDetails.avg_review_rating = avg_review_rating / reviewCount;
						propertyDetails.review_types = review_types;						
						Claim.find({}, function(err, claimData) {
							if (err){
								req.flash('error', 'property and review users fetching error for selected location');
								res.redirect('/admin/locations');
							}
							if(claimData==null){
								claimStatus=0;
							}else if(claimData.length==0){
								claimStatus=0;
							}else{
								claimData.forEach(function(cliam){
									if(cliam.property_id==req.query.id){
										claimStatus=1;
									}
								});									
							}
							console.log("res.render call");
							res.render('admin/locationDetail.ejs', {
								error : req.flash("error"),
								success: req.flash("success"),
								property: propertyDetails,
								category: category,
								page: page,							
								counter : reviewCount,
								claimStatus: claimStatus,
								perPage: perPage
							});
						});
					});
				});
			});
		});	
	});
}

exports.CheckInPage = function(req, res){
	if(req.body.propertyId){
		Reviews.find().sort([['id', 'descending']]).limit(1).exec(function(err, reviewdata) { 
			if(err){
				res.send({'status':false,'message':'Something went wrong while getting data'});
			}
			var newReviews = new Reviews();
			var day = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
			newReviews.status = 0;
			newReviews.user_id = req.session.user.id;		
		    newReviews.user = req.session.user._id;
		    newReviews.is_type = 1;
		    newReviews.review_rating = parseInt(req.body.addstar);
		    newReviews.checkin_mood = req.body.feeling;
		    newReviews.property_id = parseInt(req.body.propertyId);
		    newReviews.property = req.body.property_Id;
		    newReviews.ip_address = req.session.ip_address;
		    newReviews.user_location = req.session.country;
		    newReviews.created_date = day;
		    newReviews.updated_date = day;
		    newReviews.timestamp = Math.floor(Date.now() / 1000)/(60*60);
		    if(reviewdata.length==0){
		    	newReviews.id = 1;
		    }else{
				newReviews.id = reviewdata[0].id+1;
		    }
		    newReviews.save(function(err) {
		    	if(err){
		    		console.log(err);
		        	res.send({'status':false,'message':'Something went wrong while saving data'});
				}else{
					res.send({'status':true,'message':'Checkin successfully'});
				}
		    });

		});
	}else{
		res.send({'status':false,'message':'Something went wrong'});
	}
}

exports.checkForCheckInPage = function(req, res){
	var user_id = req.session.user.id;
	var property_id = req.query.propertyId;
	var current_hour = Math.floor(Date.now() / 1000)/(60*60);
	var previous_hour = current_hour - 2;
	
	Reviews.countDocuments({user_id:user_id, timestamp: { $gt: previous_hour, $lt: current_hour }}, function(err,c){
		if(c>0){
			res.send({status:false, message:'hourlimit'});
		}
		else
		{	
			res.send({status: true});
		}		
	});
		
}

exports.deactivateLocation = function(req, res) {
	Property.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find Location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{  
    	    var property_user = p.user;
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Could not find location');
		    }
		    else{
		    	ReportFlag.findOne({property:req.query.id, report_type:parseInt(2)}, function(err, r) {
		    		if(!r){
		    			req.flash('error', 'Could not find Flag');
		    			res.redirect('/admin/locations');
		    		}
		    		else{
		    			r.status = parseInt(1);
		    			r.save(function(err){
		    				if(err){
		    				req.flash('error', 'Could not find Flag');
		    				}
		    				else{
		    					User.findOne({_id:property_user}, function(err, userdata){
		    						var activityData = {
		            					user: userdata._id,
		            					description: 'Your one location is reported as sapm and deactivated which is ',
		            					property: p._id,
		            					target_user: null
		            				}

					            	activities.storeRecentActivity(activityData);

		            				ReportFlag.findOne({property:p.id}, function(err, reporterdata){
		            				var activityData = {
		            					user: reporterdata.user,
		            					description: 'Your reported location is deactivated which is ',
		            					property: p._id,
		            					target_user: null
		            				}

					            	activities.storeRecentActivity(activityData);
		    			        	});

		    					if(!userdata){
		    						req.flash('error', 'Error in fetching userdetail');
    								res.redirect('/admin/locations');
		    					}else{

				    			var sendmail = {
				            		receiver_name: userdata.first_name,
		        		    		receiver_email: userdata.mail,
		            				email_type: 7
		            			}

            					dynamicmail.sendMail(sendmail);
    							req.flash('success', 'Location deactivated successfully');
    							if(req.query.returnback=='flaggedlocation'){
    								res.redirect('/admin/flaggedlocation');
    							}else if(req.query.returnback=='featuredlisting'){
    								res.redirect('/admin/featuredlisting');
    							}else{
									res.redirect('/admin/locations');	
    							}
		    				}
		    			});
		    		}
				});
		    }
		});	    	
	}
});
}
});
}

exports.activateLocation = function(req, res) {
	var currentStatus
	Property.findOne({id:req.query.id}, function(err, p) {
		currentStatus = p.status;
  		if (!p){
    		req.flash('error', 'Could not find location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{   
  			var property_user = p.user;
  			var id = p._id;
    	    p.status = parseInt(1);
		    p.save(function(err) {
			    if (err){
		    	    req.flash('error', 'Could not find location');
		    	    res.redirect('/errorpage');
			    }
			    else{

			    	ReportFlag.deleteOne({property:p.id}, function(err){
			    		if(err){
			    			req.flash('error', 'Something went wrong while delete');
			    			res.redirect('/errorpage');
			    		}
			    	});

			    	User.findOne({_id:property_user}, function(err, userdata){
			    	var activityData = {
		            		user: userdata._id,
		            		description: 'your location is activated and which is ',
		            		property: id,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);

			    		if(!userdata){
			    			req.flash('error', 'Error in fetching userdetail');
	    					res.redirect('/admin/locations');
			    		}else{

					    	if(currentStatus==0){

					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 6
				            	}

		            			dynamicmail.sendMail(sendmail);
		            			
					    		req.flash('success', 'Location has been approved successfully');

					    	}else{
					    		
					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 8
				            	}

		            			dynamicmail.sendMail(sendmail);

			    				req.flash('success', 'Location has been activated successfully');
					    	}
							res.redirect('/admin/locations');	
			    		}
			    		
			    	})
				}
		    });
  		}
	});
}

exports.rejectLocation = function(req, res) {	
	Property.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{   
  			var property_user = p.user;
  			var id = p._id;
    	    p.status = parseInt(2);
		    p.save(function(err) {
			    if (err){
		    	    req.flash('error', 'Could not find location');
		    	    res.redirect('/errorpage');
			    }
			    else{

			    	User.findOne({_id:property_user}, function(err, userdata){

			    		if(!userdata){
			    			req.flash('error', 'Error in fetching userdetail');
	    					res.redirect('/admin/locations');
			    		}else{

					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 6
				            	}

		            			dynamicmail.sendMail(sendmail);
		            			
					    		req.flash('success', 'Location has been deactivated successfully');
								res.redirect('/admin/locations');	
			    		}
			    		
			    	})
				}
		    });
  		}
	});
}

exports.approveLocation = function(req, res) {	
	var currentStatus
	var propertyList = [];
	Property.findOne({id:req.query.id}, function(err, p) {
		currentStatus = p.status;
  		if (!p){
    		req.flash('error', 'Could not find location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{   
  			var property_user = p.user;
  			var id = p._id;
    	    p.status = parseInt(1);
		    p.save(function(err) {
			    if (err){
		    	    req.flash('error', 'Could not find location');
		    	    res.redirect('/errorpage');
			    }
			    else{

			    	User.findOne({_id:property_user}, function(err, userdata){

			    		if(userdata.property.includes(p._id)){
			    			console.log("Already have this property");
			    		}else{
			    			propertyList = userdata.property;
			    			userdata.property.push(p._id);
			    			console.log(userdata.property);
			    			userdata.property = propertyList;
			    			userdata.save(function(err){
			    				if(err){
									req.flash('error','save error');
									res.redirect('/errorpage');
								}
								else{
									console.log("save property to user is successful");
								}
			    			});
			    		}

			    		var tokenData = {
			    			sender: req.app.locals.admin_account_id,
			    			receiver: userdata._id,
			    			amount: 1,
			    			operation: 'plus',
			    			type: 1, //type 1 = token and type 2 = point
			    			description: 'You earned 1 Token for Add Location'
			    		}

		            	tokenallocate.issueToken(tokenData);

		            	var activityData = {
		            		user: userdata._id,
		            		description: 'Added New Location ',
		            		property: id,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);

			    		if(!userdata){
			    			req.flash('error', 'Error in fetching userdetail');
	    					res.redirect('/admin/locations');
			    		}else{

					    	if(currentStatus==0){

					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 6
				            	}

		            			dynamicmail.sendMail(sendmail);
		            			
					    		req.flash('success', 'Location has been approved successfully');

					    	}else{
					    		
					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 8
				            	}

		            			dynamicmail.sendMail(sendmail);

			    				req.flash('success', 'Location has been activated successfully');
					    	}
							res.redirect('/admin/locations');	
			    		}
			    		
			    	})
				}
		    });
  		}
	});
}

exports.allProperties = async function (req, res) {
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='id';
	let ordered_sort = -1;
	let categoryList = [];
	let filters = {};
	let status = [];
	let category_filter = {};

	if(req.query.perpage){
		perpage=parseInt(req.query.perpage);
	}
	if(req.query.keyword){
		keyword=req.query.keyword;
	}
	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}	
	if(req.query.keyword){
		keyword = req.query.keyword.trim().toLowerCase();			
	}
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;
	}
	if(req.query.ordered_sort){
		ordered_sort=parseInt(req.query.ordered_sort);
	}
		
	if(req.query.filter1){ status.push(0);  filters.filter1=req.query.filter1;}
	if(req.query.filter2){ status.push(1);	filters.filter2=req.query.filter2;}
	if(req.query.filter3){ status.push(2);	filters.filter3=req.query.filter3;}
	if(req.query.category_filter) {	filters.category_filter=req.query.category_filter;	}

	if(!req.query.filter1 && !req.query.filter2 && !req.query.filter3){
		status=[0,1,2];
	}
	if(Object.keys(req.query).length == 0){
		status=[0,1,2,3];
	}
	if(Object.keys(req.query).length == 1 && req.query.category_filter){
		status=[0,1,2,3];
	}
	if(Object.keys(req.query).length == 1 && status.length==0){
		status=[0,1,2,3];
	}	
	
	if(Object.keys(filters).length>0 && filters.category_filter){
		category_filter.id=filters.category_filter;
	}
	var sortClause = '';
	let properties = [];
	if(ordered_column=='property_name'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'property_name':ordered_sort}).skip(skip).limit(perpage).exec();

	}else if(ordered_column=='user.contact_number'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'user.contact_number':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.mail'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'user.mail':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='status'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'status':ordered_sort}).skip(skip).limit(perpage).exec();		
	}else{
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'id':ordered_sort}).skip(skip).limit(perpage).exec();
	}

	//console.log(properties);
	var subObject={};

	total_count = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}
    page_count = Math.ceil(total_count/perpage);

    //Get Categories Data
    var categories = await Category.find();
	categories.forEach(function(category) {
		categoryList[category.id]=category;
	}); 
	
    res.render('admin/allProperties.ejs', {
        error: req.flash("error"),
        success: req.flash("success"),
        categories: categoryList,        
        properties: properties,
        filters: filters,
        page: page,
		perpage:perpage,
		total_count: total_count,
		total_pages: page_count,
		keyword: keyword,
		ordered_sort: ordered_sort,
		ordered_column: ordered_column,
    }); 
}

exports.featuredlistingPage = async function(req, res){
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='id';
	let ordered_sort = -1;
	let categoryList = [];
	let filters = {};
	let status = [];
	let category_filter = {};

	if(req.query.perpage){
		perpage=parseInt(req.query.perpage);
	}
	if(req.query.keyword){
		keyword=req.query.keyword;
	}
	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}	
	if(req.query.keyword){
		keyword = req.query.keyword.trim().toLowerCase();			
	}
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;
	}
	if(req.query.ordered_sort){
		ordered_sort=parseInt(req.query.ordered_sort);
	}
		
	var sortClause = '';
	let properties = [];
	if(ordered_column=='property_name'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'property_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='plan.title'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'plan.title':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='feature_start_date'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'feature_start_date':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='featured_end_date'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'featured_end_date':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();	
	}else if(ordered_column=='status'){
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'status':ordered_sort}).skip(skip).limit(perpage).exec();		
	}else{
		properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}}]).collation({ locale: "en" }).sort({'id':ordered_sort}).skip(skip).limit(perpage).exec();
	}

	var subObject={};

	total_count = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $lookup: { from: "businessplans", localField: "featured_plan_id", foreignField:"id", as: "plan"}} ,{ $unwind: "$user"},{ $unwind: "$plan"},{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{feature_start_date: { "$regex": keyword, "$options": "i" }},{featured_end_date: { "$regex": keyword, "$options": "i" }},{'plan.title': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{is_featured: 1}]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}
    page_count = Math.ceil(total_count/perpage);

    //Get Categories Data
    var categories = await Category.find();
	categories.forEach(function(category) {
		categoryList[category.id]=category;
	}); 
	
    res.render('admin/featuredlisting.ejs', {
        error: req.flash("error"),
        success: req.flash("success"),
        categories: categoryList,        
        properties: properties,
        filters: filters,
        page: page,
		perpage:perpage,
		total_count: total_count,
		total_pages: page_count,
		keyword: keyword,
		ordered_sort: ordered_sort,
		ordered_column: ordered_column,
		moment: moment
    });
}

exports.rejectLocationFlagRequest = async function(req, res){
	let reportflag = await ReportFlag.findOne({id:req.query.id}).exec();	
	var spam_location = reportflag.property;
	var flagger = reportflag.user;
	var deleteList = [];
	let propertydata = await Property.findOne({id:spam_location}).exec();
	var pdata = propertydata._id;
	let SpamList = await ReportFlag.find({property:spam_location}).exec();
	if(SpamList.length > 0){
		SpamList.forEach(function(location){
			deleteList.push(location.id);
		})

		ReportFlag.deleteMany({id:{$in:deleteList}},function(err){
			if(err){
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
			}else{
				
					var activityData = {
		            		user: flagger,
		            		description: 'Your request for spam location is rejected for ',
		            		property: pdata,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);
				
				req.flash('success', 'Request Rejected successfully');
		     	res.redirect('/admin/flaggedlocation');
			}
		});
	}

}

function getUsers(categoryList,propertyList, usersIds,req,res,filters){
	var usersList = [];
	User.find({'id':{ $in: usersIds }},function(err,users){
		users.forEach(function(user) {	      	
	      	usersList[user.id] = [];
	      	usersList[user.id]["first_name"] = user.first_name;
	      	usersList[user.id]["last_name"] = user.last_name;
	      	usersList[user.id]["mail"] = user.mail;
	      	usersList[user.id]["contact_number"] = user.contact_number;
		});
		console.log("Actual counts:"+propertyList.length);
		res.render('admin/allProperties.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
			userLists: usersList,
			filters: filters,
			properties: propertyList
		});
	});	
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }