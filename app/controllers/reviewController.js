var numeral 	 = require('numeral');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models       = require('../../app/models/revstance_models');
var activities = require('../../app/controllers/activityController');
var dynamicmail  = require('../../app/controllers/dynamicMailController');
var tokenallocate   = require('../../app/controllers/tokenController');
var User         = models.User;
var Review 		 = models.Review;
var Property 	 = models.Property;
var Like   	     = models.Like;
var ReportFlag   = models.ReportFlag;

exports.removeReviewReply = function(req, res) {
	console.log(req.body.id);
	Review.findOneAndUpdate({id:req.body.id}, {is_reply:parseInt(0),reply_text:'',reply_created_date:''}, {upsert:true}, function(err, doc){
    	if (err) return res.send({success:false,id: req.body.id});
    	else return res.send({success:true,id : req.body.id});
	});
}

exports.getAllReviews = function(req,res){
	var reviewCounter = 0;
	var reviewsList = [];
	var page = 1;
	var perPage = 10;
	var properties = [];
	var usersList = [];
	var users  = [];
	var conditions = {};			
	if(req.query.property_id){		
		conditions['property_id']=req.query.id;	
	}
	Review.find(conditions, function(err, allReviews) {
		if (err){
			req.flash('error', 'Error : review fetching error for selected location');
			res.redirect('/admin/reviews');
		}
		reviewCounter = reviewData.length;
		Review.find(conditions).limit(perPage).skip(perPage * page).exec(function(err, propertyReview) {
	    	if(err){
		  		req.flash('error', 'Error : something is wrong in review getting');
				res.redirect('/errorpage');
			}
			propertyReview.forEach(function(review){
				reviewsList.push(review);
				if(review.property_id.length>0) propertyIds.push(review.property_id);
				if(review.review_id.length>0) reviewIds.push(review.review_id);
				if(review.user_id.length>0) userIds.push(review.user_id);
				User.find({'id':{ $in: userIds }},function(err,users){
					if (err){
						req.flash('error', 'Error : something is wrong in getting users');
						res.redirect('/admin/locations');
					}
					users.forEach(function(user) {	      	
				      	usersList[user.id] = user.first_name+" "+user.last_name;
					});
					Property.find({'id':{ $in: propertyIds }},function(err, properties){
						if (err){
							req.flash('error', 'Error : something is wrong in getting users');
							res.redirect('/admin/locations');
						}
						properties.forEach(function(property) {	      	
					      	usersList[property.id] = property.property_name;
						});						
						res.render('admin/reviewsList.ejs', {
							error : req.flash("error"),
							success: req.flash("success")			
						});
					});
				});
			});
		});
	});
}	

exports.getAllReviewsById = function(req,res){
	res.render('admin/reviewsList.ejs', {
		error : req.flash("error"),
		success: req.flash("success")			
	});
}

exports.deleteReviewById = function(req, res){
	//res.send({success:true});/*
	Review.find({ id:req.body.id }).remove(function(err){
		if(err){
			res.send({success:false});
		}else{
			ReportFlag.find({review: req.body.id}).remove(function(err){
				if (err){
					res.send({success:false});
				}
				Like.find({review_id: req.body.id}).remove(function(err){
					if (err){
						res.send({success:false});
					}	
					res.send({success:true});
				});
			});
		}
	});
}

exports.cancelFlaggedReview = function(req, res) {
	ReportFlag.find({review: req.body.id}).remove(function(err){
		if (err){
			res.send({success:false});
		}
		res.send({success:true,id:req.body.id});
	});
}

exports.manageFlag = function(req, res){
	var message = {};
	if(req.session.user){		
		if(req.body.status==1){			
			ReportFlag.find().sort([['id', 'descending']]).limit(1).exec(function(err, flagdata) {
				var flagObj = ReportFlag(); 
				console.log(flagdata);
				if(flagdata == null){
					flagObj.id 	= 1;
				}
				else if(flagdata.length==0){
					flagObj.id 		= 1;	 
				}
				else flagObj.id = flagdata[0].id+1;
				flagObj.user = req.session.user._id; 
				flagObj.review = parseInt(req.body.review_id);
				flagObj.property = parseInt(req.body.property_id); 
				flagObj.report_type = parseInt(3);
				flagObj.status = 1;
				flagObj.created_date = getDate();
				flagObj.updated_date = getDate();
				flagObj.save(function(err) {
					if(err){
						message.success = false;
						message.message = "Flag saved failed.";
						res.send(message);
					}else{
						req.session.flagedReviews.push(req.body.review_id);
						message.success = true;
						message.message ="Flag saved. ";
						res.send(message);
					}
				});
			});		
		}else{
			console.log(req.body);
			ReportFlag.find({ review:req.body.review_id, user: req.session.user.id }).remove(function(err){
				if(err){
					message.success = true;
					message.message ="Delete failed. ";
					res.send(message);
				}else{
					var index = req.session.flagedReviews.indexOf(req.body.review_id);
					if (index > -1) {
					    req.session.flagedReviews.splice(index, 1);
					}
					message.success = true;
					message.message ="Unflag saved";
					res.send(message);
				}
			});
		}
	}else{
		res.send({success:false});
	}
}

exports.reportFlag = function(req, res) {
	Review.findOne({id:req.query.id, user:req.query.user}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find Review');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{  
    	    var property_user = p.user;
    	    p.status = parseInt(1);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Could not find review');
		    }
		    else{
		    	ReportFlag.findOne({review:req.query.id}, function(err, r) {
		    		if(!r){
		    			req.flash('error', 'Could not find review flags');
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
		            					description: 'Your one review is reported as sapm and deactivated',
		            					property: p._id,
		            					target_user: null
		            				}

					            	activities.storeRecentActivity(activityData);

		            				ReportFlag.findOne({review:p.id}, function(err, reporterdata){
		            				var activityData = {
		            					user: reporterdata.user,
		            					description: 'Your reported review is deactivated',
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
    							req.flash('success', 'Review deactivated successfully.');
    							if(req.query.returnback=='flagged-reviews'){
    								res.redirect('/admin/flagged-reviews');
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

exports.rejectReviewFlagRequest = async function(req, res) {
	let reportflag = await ReportFlag.findOne({id:req.query.id}).exec();	
	var spam_review = reportflag.review;
	var flagger = reportflag.user;
	var deleteList = [];
	let reviewdata = await Review.findOne({id:spam_review}).exec();
	var rdata = reviewdata._id;
	let SpamList = await ReportFlag.find({review:spam_review}).exec();
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
		            		description: 'Your request for spam review is rejected',
		            		property: rdata,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);
				
				req.flash('success', 'Request Rejected successfully');
		     	res.redirect('/admin/flagged-reviews');
			}
		});
	}
}

exports.manageLike = function(req, res){	
	var message = {};
	var newid = 0;
	if(req.session.user){		
		if(req.body.status==1){			
			Like.find().sort([['id', 'descending']]).limit(1).exec(function(err, flagdata) {
				var flagObj = Like();
				console.log(flagdata);
				if(flagdata == null){
					flagObj.id 	= 1;
				}
				else if(flagdata.length==0){
					flagObj.id 		= 1;	
				}
				else flagObj.id = flagdata[0].id+1;
				newid = flagObj.id;
				flagObj.user = req.session.user._id;
				flagObj.review = req.body.review_id;
				flagObj.property = req.body.property_id;
				flagObj.review_emoji = "Thumbs Up";
				flagObj.created_date=getDate();
				flagObj.status = 1;
				flagObj.save(function(err) {
					if(err){
						message.success = false;
						message.message = "Like saved failed.";
						res.send(message);
					}else{
						Property.findOne({_id:req.body.property_id}, function(err,propertydata){
						var activityData = {
		            		user: req.session.user._id,
		            		description: 'Upvotes a review for location ',
		            		property: req.body.property_id,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);
		            });

						if(newid!=0) req.session.likedReviews.push(req.body.review_id);						
						message.success = true;
						message.id = newid;
						message.message ="Like saved. ";
						res.send(message);
					}
				});
			});		
		}else{		
		//data: {review_id:review_id, status:0,property_id:property_id},	
			Like.find({ review_id:req.body.review_id, user_id: req.session.user.id }).remove(function(err){
				message.review_id = req.body.review_id;
				message.user_id = req.user.user_id;
				if(err){
					message.success = true;
					message.message ="Delete failed. ";
					res.send(message);
				}else{
					var index = req.session.likedReviews.indexOf(req.body.review_id);
					if (index > -1) {
					    req.session.likedReviews.splice(index, 1);
					}
					message.success = true;
					message.message ="Unlike saved";
					res.send(message);
				}
			});
		}
	}else{
		res.send({success:false});
	}	
}
exports.getAllFlaggedReviews = async function(req, res){
	let page=0;
	let skip=0;
	let perpage=10;
	var flaggedReviewList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='first_name';
	let ordered_sort = 0;
	if(req.query.perpage){
		perpage=parseInt(req.query.perpage);
	}
	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}	
	if(req.query.keyword){
		keyword = req.query.keyword.trim().toLowerCase();			
	}
	var sortClause = {};
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;		
	}
	if(req.query.ordered_sort){
		ordered_sort=parseInt(req.query.ordered_sort);
	}	

	let users = [];
	let reportflag = [];
	if(ordered_column=='first_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "reviews", localField: "review", foreignField:"id", as: "spamreview"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "property"}},{ $unwind: "$property"},{ $unwind: "$user"},{ $unwind: "$spamreview"},{ $match: {$and: [{$or: [{'spamreview.id': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'property.property_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 3 }]}}]).collation({ locale: "en" }).sort({'spamreview.id':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "reviews", localField: "review", foreignField:"id", as: "spamreview"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "property"}},{ $unwind: "$property"},{ $unwind: "$user"},{ $unwind: "$spamreview"},{ $match: {$and: [{$or: [{'spamreview.id': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'property.property_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 3 }]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else{
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "reviews", localField: "review", foreignField:"id", as: "spamreview"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "property"}},{ $unwind: "$property"},{ $unwind: "$user"},{ $unwind: "$spamreview"},{ $match: {$and: [{$or: [{'spamreview.id': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'property.property_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 3 }]}}]).collation({ locale: "en" }).sort({'spamreview.id':ordered_sort}).skip(skip).limit(perpage).exec();
	}	

	total_count = await ReportFlag.aggregate([{ $lookup: { from: "reviews", localField: "review", foreignField:"id", as: "spamreview"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "property"}},{ $unwind: "$property"},{ $unwind: "$user"},{ $unwind: "$spamreview"},{ $match: {$and: [{$or: [{'spamreview.id': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'property.property_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 3 }]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();
	
	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}

	page_count = Math.ceil(total_count/perpage);	
	    reportflag.forEach(function(flags) {
	      flaggedReviewList.push(flags);
	    });	    
	    console.log(flaggedReviewList);

		res.render('admin/allFlaggedReviews.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			flagged_reviews: flaggedReviewList,
			page: page,
			perpage:perpage,
			total_count: total_count,
			total_pages: page_count,
			keyword: keyword,
			ordered_sort: ordered_sort,
			ordered_column: ordered_column,
			counter:total_count,
		});
}


function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }
