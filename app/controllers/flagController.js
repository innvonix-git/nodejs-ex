let numeral 	= require('numeral');
let bcrypt 		= require('bcrypt-nodejs');
let dateFormat  = require('dateformat');
let fs          = require('fs');
let moment = require('moment');
let models      = require('../../app/models/revstance_models');
let User 		= models.User;
let Property 	= models.Property;
let Review 		= models.Review;
let FlaggedReview= models.Flag;
let ReportFlag   = models.ReportFlag;
let Like   	     = models.Like;
let Membership   = models.Membership;
let constants = require('../../config/constants'); 
let tokenallocate   = require('../../app/controllers/tokenController');

exports.reportLocationUnSpam = async function(req, res) {
	let backURL=req.header('Referer') || '/';	
	try{
		let location = req.params.location;		
		let check_exist = await ReportFlag.find({report_type:parseInt(2),user:req.session.user._id,property:location}).exec();
		if(check_exist.length>0){
			let spam = await ReportFlag.findOneAndRemove({report_type:parseInt(2),user:req.session.user._id,property:location}).exec();
			console.log(spam);
			req.flash('success','Reporting unspam Successfully.');
		}else{
			req.flash('success','Reporting unspam Successfully.');
		}
	}catch(err){
		console.log(err);
		req.flash('error','Error while reporting location as unspam.');
	}
	res.redirect(backURL);
}
 
exports.reportLocationSpam = async function(req, res) {
	let backURL=req.header('Referer') || '/';	
	try{
		let location = req.params.location;		
		let check_exist = await ReportFlag.find({report_type:parseInt(2),user:req.session.user._id,property:location}).exec();
		let count = await ReportFlag.find().sort({id:-1}).limit(1);
		let nextId = 1;
		if(count.length>0){
			nextId = parseInt(count[0].id)+1;
		}
		if(check_exist.length==0){
			reportFlag = new ReportFlag({
				'id': nextId,
				'user':req.session.user._id,
				'property': parseInt(location),
				'report_type': parseInt(2),
				'spam_user': parseInt(0),
				'created_date': getDate(),
				'updated_date': getDate()
			});
			let insertedFlag = await reportFlag.save();
			req.flash('success','Reporting spam Successfully.');
			res.redirect(backURL);
		}
	}catch(err){
		console.log(err);
		req.flash('error','Error while reporting location as spam.');
		res.redirect(backURL);
	}
}

function getDate(){ 
    return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

exports.reportunFlag = async function(req, res){
	let flag_type = parseInt(req.params.flag_type);
	let flag_id = parseInt(req.params.user_id);
	let login_user = req.session.user._id;
	console.log("flag_type"+flag_type);
	console.log("flag_id"+flag_id);
	console.log("login_user"+login_user);
	let backURL=req.header('Referer') || '/';	
	if(flag_type==1){
		data = await User.findOne({id:flag_id}).exec();
		check_exist = await ReportFlag.findOne({report_type:1,user:login_user,spam_user:flag_id}).exec();
		console.log(check_exist);
	}else if(flag_type==2){
		data = await Property.findOne({id:flag_id}).exec();
		check_exist = await ReportFlag.find({report_type:1,user:login_user,property:flag_id}).exec();		
	}else{
		req.flash('error','Something went wrong in flag type');
		res.redirect('/errorpage');
	}	
	console.log(check_exist);
	if(check_exist.length <= 0){
		req.flash('error','No flag found in system.');
		res.redirect(backURL);
	}else{		
		console.log("Id to remove:"+check_exist._id);
		let removedUSer = await ReportFlag.findOneAndRemove({_id: check_exist._id});	
		req.flash('success','Reporting unspam Successfully.');
		res.redirect(backURL);
	}
}

exports.reportFlag = async function(req, res){
	let flag_type = parseInt(req.params.typeId);
	let flag_id = parseInt(req.params.flagId);
	let login_user = req.session.user._id;

	if(flag_type==1){
		data = await User.findOne({id:flag_id}).exec();
		check_exist = await ReportFlag.find({report_type:1,user:login_user,spam_user:flag_id}).exec();

	}else if(flag_type==2){
		data = await Property.findOne({id:flag_id}).exec();
		check_exist = await ReportFlag.find({report_type:1,user:login_user,property:flag_id}).exec();
	}else{
		req.flash('error','Something went wrong in flag type');
		res.redirect('/errorpage');
	}

	if(check_exist.length > 0){
		req.flash('success','User already spamed.');
		backURL=req.header('Referer') || '/';
  		res.redirect(backURL);
	}else{
		if(data){
			ReportFlag.find().sort([['id','descending']]).limit(1).exec(function(err,reportflag){
				if(err){
					req.flash('error','Something went wrong while fetching flagged details');
					res.redirect('/errorpage');
				}
				let newFlagged = new ReportFlag();
				let day = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
				if(reportflag.length>0){
					newFlagged.id = reportflag[0].id+1;
				}else{
					newFlagged.id = 1;
				}
				newFlagged.user = login_user;
				newFlagged.report_type = flag_type;
				newFlagged.created_date = day;
				newFlagged.updated_date = day;
				if(flag_type==1){
					newFlagged.spam_user = flag_id;
				}else{
					newFlagged.property = flag_id;
				}
				newFlagged.save(function(err){
					if(err){
						req.flash('error','Something went wrong while saving flagged details');
						res.redirect('/errorpage');
					}else{
						if(flag_type==1){
							req.flash('success','Reporting spam Successfully');
							req.session.flaggedUsers.push(flag_id);
							console.log(req.session.flaggedUsers);
						}else{
							req.flash('success','Reporting spam Successfully');
						}
						backURL=req.header('Referer') || '/';
  						res.redirect(backURL);						
					}
				});
			})
		}else{
			req.flash('error','Something went wrong while fetching data');
			res.redirect('/errorpage');
		}
	}
}

exports.flaggeduserList = async function(req, res){
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='spamuser.first_name';
	let ordered_sort = 1;
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
	if(ordered_column=='spamuser.first_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "users", localField: "spam_user", foreignField:"id", as: "spamuser"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamuser"},{ $match: {$and: [{$or: [{'spamuser.first_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 1 }]}}]).collation({ locale: "en" }).sort({'spamuser.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "users", localField: "spam_user", foreignField:"id", as: "spamuser"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamuser"},{ $match: {$and: [{$or: [{'spamuser.first_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 1 }]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else{
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "users", localField: "spam_user", foreignField:"id", as: "spamuser"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamuser"},{ $match: {$and: [{$or: [{'spamuser.first_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 1 }]}}]).collation({ locale: "en" }).sort({'spamuser.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}

	total_count = await ReportFlag.aggregate([{ $lookup: { from: "users", localField: "spam_user", foreignField:"id", as: "spamuser"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamuser"},{ $match: {$and: [{$or: [{'spamuser.first_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 1 }]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}
	page_count = Math.ceil(total_count/perpage);	
	    reportflag.forEach(function(flags) {
	      usersList.push(flags);
	    });	    
		res.render('admin/flaggeduser.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			users: usersList,
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

exports.flaggedlocationList = async function(req, res){
	let page=0;
	let skip=0;
	let perpage=10;
	let locationsList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='spamlocation.property_name';
	let ordered_sort = 1;
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
	if(ordered_column=='spamlocation.property_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "spamlocation"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamlocation"},{ $match: {$and: [{$or: [{'spamlocation.property_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 2 }]}}]).collation({ locale: "en" }).sort({'spamlocation.property_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "spamlocation"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamlocation"},{ $match: {$and: [{$or: [{'spamlocation.property_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 2 }]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else{
		reportflag = await ReportFlag.aggregate([{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "spamlocation"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamlocation"},{ $match: {$and: [{$or: [{'spamlocation.property_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 2 }]}}]).collation({ locale: "en" }).sort({'spamlocation.property_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}	

	total_count = await ReportFlag.aggregate([{ $lookup: { from: "properties", localField: "property", foreignField:"id", as: "spamlocation"}},{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{ $unwind: "$spamlocation"},{ $match: {$and: [{$or: [{'spamlocation.property_name': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]},{ report_type: 2 }]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();
	
	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}

	page_count = Math.ceil(total_count/perpage);	
	    reportflag.forEach(function(flags) {
	      locationsList.push(flags);
	    });	 
	    console.log(locationsList);

		res.render('admin/flaggedlocation.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			locations: locationsList,
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