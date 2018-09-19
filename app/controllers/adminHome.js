var numeral 	 = require('numeral');
var mongoose = require('mongoose');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models       = require('../../app/models/revstance_models');
var moment 		 = require('moment');
var User         = models.User;
var Property     = models.Property;
var Category     = models.Category;
var Reviews      = models.Review; 
var FlaggedReview= models.Flag;
var Transaction  = models.Transaction;
var TokenLog 	 = models.TokenLog;
var StanceLevel  = models.StanceLevel;
var ReportFlag   = models.ReportFlag;
var Setting      = models.Setting;
const ObjectId = mongoose.Types.ObjectId;
var activities = require('../../app/controllers/activityController');
/* Middleware Check for Admin Type User*/ 
exports.loggedIn = function(req, res, next)
{
	if (req.session.user && req.session.user.user_type==3) {
		next();
	} else {
		req.flash('error', 'Sorry, you do not have sufficient rights to access.');
		res.redirect('/login');
	}
}

function getDate(){ 
    return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

/* Get User for Admin Side User Page*/
exports.allUsers = async function(req,res) {
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='id';
	let ordered_sort = -1;
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
	if(ordered_column=='first_name'){		
		sortClause.first_name=ordered_sort;	
	}else if(ordered_column=='last_name'){
		sortClause.last_name=ordered_sort;		
	}else if(ordered_column=='mail'){
		sortClause.mail=ordered_sort;	
	}else if(ordered_column=='city'){
		sortClause.city=ordered_sort;
	}else if(ordered_column=='status'){
		sortClause.status=ordered_sort;
	}else{
		sortClause.id=ordered_sort;
	}
	console.log(sortClause);
	users = await User.find({$and: [{$or: [ {first_name: { "$regex": keyword, "$options": "i" }},{ last_name:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } },{city: { "$regex": keyword, "$options": "i" }}]},{user_type:1}]}).collation({ locale: "en" }).sort(sortClause).skip(skip).limit(perpage).exec();	
	
	total_count = await User.find({$and: [{$or: [ {first_name: { "$regex": keyword, "$options": "i" }},{ last_name:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } },{city: { "$regex": keyword, "$options": "i" }}]},{user_type:1}]}).count();
	page_count = Math.ceil(total_count/perpage);	
	    users.forEach(function(user) {
	      usersList.push(user);
	    });	    
		res.render('admin/allUsers.ejs', {
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


/*Transfer Token - Developer: Rushabh Madhu*/
exports.transferToken = async function(req, res, next)
{	let userTypes = [1,2];
	let status = [1,2];
	let users = await User.find({$and: [{'user_type': {$in: userTypes } },{'status': {$in: status } }]});
	res.render('admin/token_transfer.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		users: users,
	});
}

exports.transferTokenSave = async function(req, res, next)
{
	let user = '';
	let amount = '';	
	try{
		if(req.body.amount){
			amount = req.body.amount;
			console.log(amount);
		}
		if(req.body.user){
			user =req.body.user;
		}if(amount == 0){
			req.flash('error', 'can not transfer 0 Token');
			backURL=req.header('Referer') || '/';
  			res.redirect(backURL)
		}	
		if(amount > 0){
			var transaction = new TokenLog();
			transaction.id=parseInt(1);
			transaction.token_amount=amount;
			transaction.type=parseInt(1);
			transaction.user=user;
			transaction.operation='plus';
			transaction.description ="Transferred by admin";
			transaction.status=parseInt(1),
			transaction.created_date = getDate();
			transaction.from = req.app.locals.admin_account_id;
			let done_transaction = await transaction.save();
			
			let user_obj = await User.findOne({_id:user});
			user_obj.token_balance = parseInt(user_obj.token_balance)+parseInt(amount);
			user_obj.save();		
			
			let admin_user_obj = await User.findOne({_id:req.app.locals.admin_account_id});
			admin_user_obj.token_balance = parseInt(admin_user_obj.token_balance)-parseInt(amount);
			admin_user_obj.save();	

			req.flash('success', 'Token allocated successfully.');
			backURL=req.header('Referer') || '/';
  			res.redirect(backURL)
  		}
  		if(amount < 0){

			let user_obj = await User.findOne({_id:user});
			
			if(user_obj.token_balance < Math.abs(amount)){
				req.flash('error', 'User does not have sufficient token balance');
				backURL=req.header('Referer') || '/';
  				res.redirect(backURL);
			}else{
	  			var transaction = new TokenLog();
				transaction.id=parseInt(1);
				transaction.token_amount=amount;
				transaction.type=parseInt(1);
				transaction.user=user;
				transaction.operation='minus';
				transaction.description ="Deducted by admin";
				transaction.status=parseInt(1),
				transaction.created_date = getDate();
				transaction.from = req.app.locals.admin_account_id;
				let done_transaction = await transaction.save();
				
				amount = Math.abs(amount);
				console.log(amount);
				user_obj.token_balance = parseInt(user_obj.token_balance) - parseInt(amount);
				user_obj.save();
				console.log(user_obj.token_balance);
				
				let admin_user_obj = await User.findOne({_id:req.app.locals.admin_account_id});
				admin_user_obj.token_balance = parseInt(admin_user_obj.token_balance)+parseInt(amount);
				admin_user_obj.save();	

				req.flash('success', 'Token deducted successfully.');
				backURL=req.header('Referer') || '/';
	  			res.redirect(backURL)
  			}
		}
}
		catch(err){
		  if (err.name === 'MongoError' && err.code === 11000) {
	      res.status(409).send(new MyError('Duplicate key', [err.message]));
	    }
    	res.status(500).send(err);
	}
}

/* Get Properties for Admin Side Location Page*/
exports.allProperties = function(req,res){
	var categoryList = [];
	Category.find({}, function(err, categories) {
	    categories.forEach(function(category) {
	      categoryList[category.id]=category;
	    });
	    getProperties(categoryList,req,res);
	});
}

function getProperties(categoryList,req,res){
	var propertyList = [];
	var usersIds = [];
	Property.find({},function(err,properties){
			properties.forEach(function(property) {
		      	propertyList.push(property);
		      	usersIds.push(property.user_id)
			});
			getUsers(categoryList,propertyList, usersIds,req,res);
	});
}

function getUsers(categoryList,propertyList, usersIds,req,res){
	var usersList = [];
	User.find({'id':{ $in: usersIds }},function(err,users){
		users.forEach(function(user) {
	      	usersList[user.id] = [];
	      	usersList[user.id]["first_name"] = user.first_name;
	      	usersList[user.id]["last_name"] = user.last_name;
	      	usersList[user.id]["mail"] = user.last_name;
	      	usersList[user.id]["contact_number"] = user.contact_number;
		});
		res.render('admin/allProperties.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
			userLists: usersList,
			properties: propertyList
		});
	});
}

/* Approve User form Admin Side*/
exports.approveBusinessUser = function(req,res){
	var id = req.params.id;
	var user = new User();
	    var updateValue ={
    	$set:{
    		status:2
    	}
    };
    User.findOne({id:req.params.id}, function(err, p) {
  		if (!p){
    		req.flash('success', 'Could not find User');
  		}
  		else
  		{   console.log(p);
    	    p.status = parseInt(2);
		    p.save(function(err) {
		      if (err){
	    	    req.flash('success', 'Could not find User');
		        console.log('error');
		    }
		    else{
    			req.flash('success', 'Category updated successfully.');
		        console.log('success');
		    	}
    		});
  		}
	});
	res.redirect('/admin/business-users');
}

exports.getUserDetails =async function(req,res){
	let page=0;
	let logpage=0;
	let logskip=0;
	let skip=0;
	let perpage=10;
	let total_count = 0;
	let total_log_count = 0;
	let tab = 'personal';
	var id = req.query.id;//req.query.id;
	let tokensList = [];
	let ordered_column='created_date';
	let ordered_sort = -1;

	if(req.query.perpage){
		perpage=parseInt(req.query.perpage);
	}

	if(req.query.tab){
		tab=req.query.tab;
	}
	
	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}

	if(req.query.logpage){
		logpage=parseInt(req.query.logpage);
		if(logpage<0)logpage=0;
		logskip=logpage*perpage;
	}

	var sortClause = {};
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;
	}
	if(req.query.ordered_sort){
		ordered_sort=parseInt(req.query.ordered_sort);
	}

	if(ordered_column=='created_date'){		
		sortClause.created_date=ordered_sort;	
	}

	var user = new User();
    var updateValue ={
    	$set:{
    		status:2
    	}
    };

    var user = await User.findOne({id:req.query.id}).populate({path: 'membership',model: 'Membership',select: 'membership_title'}).exec(); 
    var user_id = user._id;
	console.log("User Id"+user_id);
    var stanceBalance = parseInt(user.point_balance);
	var stanceObj = await StanceLevel.find();
	let flag=0;
	stanceObj.forEach(function(stanceData){
		if (stanceBalance >= parseInt(stanceData.start) && stanceBalance >= parseInt(stanceData.ends)){
			user.stance = stanceData.stancename;
			flag++;
		}
	});
	if(flag==0){
		user.stance = stanceObj[0].stancename;
	}

	let properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "users"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$users"} ,{$match : {user: ObjectId(user_id)}}]).collation({ locale: "en" }).skip(skip).limit(perpage).exec();
	
	total_count = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "users"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$users"} ,{$match : {user: ObjectId(user_id)}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}

    page_count = Math.ceil(total_count/perpage);

    var users_id = user._id;
 
    let tokens = await TokenLog.find({user:users_id}).collation({ locale: "en" }).sort(sortClause).skip(logskip).limit(perpage).exec();

    total_log_count = await TokenLog.countDocuments({user:users_id}).sort(sortClause).exec();

    if(total_log_count.length > 0){
		total_log_count = total_log_count[0].total_log_count;
	}
	console.log(total_log_count);

    page_count = Math.ceil(total_log_count/perpage);
    
    tokens.forEach(function(token) {
	      tokensList.push(token);	      
	    });

  	if (!user){
    	req.flash('error', 'Could not find User');
  	}
  	
  	res.render('admin/userDetails.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		user:user,
		properties:properties,
		tokens: tokensList,
		page: page,
		logpage: logpage,
		perpage:perpage,
		total_count: total_count,
		total_log_count:total_log_count,
		total_pages: page_count,
		tab:tab,
		moment:moment
	});
}

exports.getBusinessUserDetails = async function(req,res){
	let page=0;
	let logpage=0;
	let logskip=0;
	let skip=0;
	let perpage=10;
	let total_count = 0;
	let tab = 'personal';
	var id = req.query.id;//req.query.id;
	let tokensList = [];
	let ordered_column='created_date';
	let ordered_sort = -1;

	if(req.query.perpage){
		perpage=parseInt(req.query.perpage);
	}

	if(req.query.tab){
		tab=req.query.tab;
	}
	
	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}

	if(req.query.logpage){
		logpage=parseInt(req.query.logpage);
		if(logpage<0)logpage=0;
		logskip=logpage*perpage;
	}

	var sortClause = {};
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;
	}
	if(req.query.ordered_sort){
		ordered_sort=parseInt(req.query.ordered_sort);
	}

	if(ordered_column=='created_date'){		
		sortClause.created_date=ordered_sort;	
	}


	let user = await User.findOne({id:req.query.id}).exec();

	var user_id = user._id;
	console.log("User Id"+user_id);

  	let properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "users"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$users"} ,{$match : {user: ObjectId(user_id)}}]).collation({ locale: "en" }).skip(skip).limit(perpage).exec();
	
	total_count = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "users"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$users"} ,{$match : {user: ObjectId(user_id)}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}
    page_count = Math.ceil(total_count/perpage);

     var users_id = user._id;
 
    let tokens = await TokenLog.find({user:users_id}).collation({ locale: "en" }).sort(sortClause).skip(logskip).limit(perpage).exec();

    total_log_count = await TokenLog.countDocuments({user:users_id}).sort(sortClause).exec();

    if(total_log_count.length > 0){
		total_log_count = total_log_count[0].total_log_count;
	}
	console.log(total_log_count);

    page_count = Math.ceil(total_log_count/perpage);
    
    tokens.forEach(function(token) {
	      tokensList.push(token);	      
	    });

	if (!user){
		req.flash('error', 'Could not find User');
	}

	res.render('admin/businessDetails.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		user:user,
		properties:properties,
		tokens: tokensList,
		page: page,
		logpage: logpage,
		perpage:perpage,
		total_count: total_count,
		total_log_count:total_log_count,
		total_pages: page_count,
		tab:tab,
		moment:moment
	});
}

exports.allBusinessUsers = async function(req,res){
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='id';
	let ordered_sort = -1;
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

	if(ordered_column=='business_name'){		
		sortClause.business_name=ordered_sort;	
	}else if(ordered_column=='contact_number'){
		sortClause.contact_number=ordered_sort;		
	}else if(ordered_column=='mail'){
		sortClause.mail=ordered_sort;	
	}else if(ordered_column=='first_name'){
		sortClause.first_name=ordered_sort;
	}else if(ordered_column=='status'){
		sortClause.status=ordered_sort;
	}else{
		sortClause.id=ordered_sort;
	}

	let users = await User.find({$and: [{$or: [ {business_name: { "$regex": keyword, "$options": "i" }},{ first_name:{ "$regex": keyword, "$options": "i" } },{ last_name:{ "$regex": keyword, "$options": "i" } },{ contact_number:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } }]},{user_type:2}]}).collation({ locale: "en" }).sort(sortClause).skip(skip).limit(perpage).exec();

	total_count = await User.find({$and: [{$or: [ {business_name: { "$regex": keyword, "$options": "i" }},{ first_name:{ "$regex": keyword, "$options": "i" } },{ last_name:{ "$regex": keyword, "$options": "i" } },{ contact_number:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } }]},{user_type:2}]}).collation({ locale: "en" }).count();
	page_count = Math.ceil(total_count/perpage);	
	
	    users.forEach(function(user) {
	      usersList.push(user);
	    });
	  	res.render('admin/allBusinesUsers.ejs', {
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
		});
}

/* Get All Category List from Admin Side*/
exports.allCategories = async function(req,res){
	let page=0;
    let skip=0;
    let perpage=10;
    let usersList = [];
    let total_count = 0;    
    let keyword = '';
    let ordered_column='id';
    let ordered_sort = -1;
    let categoryList = [];
    var sortClause = {};
    let categorydata = [];

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
    if(req.query.ordered_column){
        ordered_column=req.query.ordered_column;
    }
    if(req.query.ordered_sort){
        ordered_sort=parseInt(req.query.ordered_sort);
    }

    if(ordered_column=='category_name'){
    	categorydata = await Category.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{$match : {$or: [ {category_name: { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]}}]).collation({ locale: "en" }).sort({'category_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='user.first_name'){
		categorydata = await Category.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{$match : {$or: [ {category_name: { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]}}]).collation({ locale: "en" }).sort({'user.first_name':ordered_sort}).skip(skip).limit(perpage).exec();
	}else if(ordered_column=='status'){
		categorydata = await Category.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{$match : {$or: [ {category_name: { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]}}]).collation({ locale: "en" }).sort({'status':ordered_sort}).skip(skip).limit(perpage).exec();
	}else{
		categorydata = await Category.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{$match : {$or: [ {category_name: { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]}}]).collation({ locale: "en" }).sort({'id':ordered_sort}).skip(skip).limit(perpage).exec();
	}

	total_count = await Category.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}},{ $unwind: "$user"},{$match : {$or: [ {category_name: { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }}]}},{$count:"total_count"}]).collation({ locale: "en" }).exec();

	if(total_count.length > 0){
		total_count = total_count[0].total_count;
	}
	page_count = Math.ceil(total_count/perpage);

	    categorydata.forEach(function(category) {
	      categoryList.push(category);
	    });
		res.render('admin/allCategories.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
			page: page,
			perpage:perpage,
			total_count: total_count,
			total_pages: page_count,
			keyword: keyword,
			ordered_sort: ordered_sort,
			ordered_column: ordered_column,
		});
}

/* Admin Side Counts on Dashboard Page*/
exports.home = function(req, res) {
	var business_users =null,regular_users=null;
	var property_counts=0,review_count=0,category_counts=0;
	var user_counts = 0;
	var business_counts = 0;

	User.count({user_type: 1}, function(err, c) {
        user_counts = c;
    }).then(function(){
    	Property.count({},function(err,c){
		property_counts = c;
		}).then(function(){
			Category.count({},function(err,c){
			category_counts = c;
			}).then(function(){
				review_counts = 0;
					User.count({user_type:2}, function(err,c){
					business_counts = c;
				}).then(function(){
					User.find({user_type:1}).limit(5).sort({id:-1}).exec(function(err, users) {
					    var usersList = [];
					    users.forEach(function(user) {
					      usersList.push(user);
					    });
					    var bUsersList = [];
					    User.find({user_type:2}).limit(5).sort({id:-1}).exec(function(err, users) {
					    users.forEach(function(user) {
					      bUsersList.push(user);
					    });
					    console.log(req.active = req.path.split('/')[1]);
						res.render('admin/adminhome.ejs', {
						error : req.flash("error"),
						success: req.flash("success"),
						user_count: user_counts,
						property_count: property_counts,
						category_count: category_counts,
						business_count: business_counts,
						review_count: review_counts,
						regular_users : usersList,
						business_users : bUsersList,
				    	});
						});
						});
					});
				});
			});
		});
};

exports.login = function(req, res) {

	var user_count = User.count({user_type: 2}, function(err, c) {
           console.log('Count is ' + c);
      });
	if (req.session.user) {
		if (req.session.user.user_type==3) {
			res.render('admin/adminhome.ejs', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session
			});
		}else{
			req.flash('error', 'Sorry, you do not have sufficient rights to access.');
			res.redirect('/login');
		}
		//res.redirect('/admin/home');
	} else {
		res.render('admin/login.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.logout = function(req, res) {
	if (req.session.user) {
		req.logout();
		req.session.destroy(function (err) {
		res.redirect('/admin/login');
		});
	}
}
/* Approve Business User From Admin Side*/
exports.approveBusinessUser = function(req, res) {
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while approved business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business approved successfully.');
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}

exports.activateBusinessUser = function(req, res) {
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while activate business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business activated successfully.');
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}

exports.suspendBusinessUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(3);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while suspended business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business suspended successfully.');    		
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}
/*Approve User from Admin Side*/
 exports.approveUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/users');
  		}
  		else
  		{
    	    p.status = parseInt(1);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while Approving User');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'User activated successfully.');
			res.redirect('/admin/users');
			}
		  });
  		}
	});
}
/*activate User from admin side*/
exports.activateUser = function(req, res){
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/users');
  		}
  		else
  		{
    	    p.status = parseInt(1);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while Approving User');
	    	    res.redirect('/errorpage');
		    }
		    else{
		    	ReportFlag.deleteOne({spam_user:p.id}, function(err){
			    		if(err){
			    			req.flash('error', 'Something went wrong while delete');
			    			res.redirect('/errorpage');
			    		}
			    	});
		    	var activityData = {
		            		user: p._id,
		            		description: 'You are now activated',
		            		property: p._id,
		            		target_user: null
		            	}

		            	activities.storeRecentActivity(activityData);

    			req.flash('success', 'User activated successfully.');
				res.redirect('/admin/users');
			}
		  });
  		}
	});
}
/*Suspend User from Admin Side*/
exports.suspendUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(3);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while suspended business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'User suspended successfully.');    		
			res.redirect('/admin/users');
			}
		  });
  		}
	});
}


exports.rejectUserFlagRequest = async function(req, res){
	let reportflag = await ReportFlag.findOne({id:req.query.id}).exec();	
	var spam_user = reportflag.spam_user;
	var spammer = reportflag.user;
	var deleteList = [];
	let targetted_user = await User.findOne({id:spam_user}).exec();
	var spammed_user = targetted_user._id;
	let SpamList = await ReportFlag.find({spam_user:spam_user}).exec();
	if(SpamList.length > 0){
		SpamList.forEach(function(user){
			deleteList.push(user.id);
		})

		ReportFlag.deleteMany({id:{$in:deleteList}},function(err){

			if(err){
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
			}else{
				User.findOne({_id:spammer}, function(err, userdata){
				console.log(userdata);
				var activityData = {
		            		user: userdata._id,
		            		description: 'Your request for spam user is rejected for ',
		            		property: null,
		            		target_user: spammed_user
		            	}

		            	activities.storeRecentActivity(activityData);
			});
				req.flash('success', 'Request Rejected successfully');
		     	res.redirect('/admin/flaggeduser');
			}
		});
	}

}
exports.adminSettingPage = async function(req, res){
	var settings = [];
	let settingsList = [];
	settingsList = await Setting.findOne({id:1}).exec();

	res.render('admin/settings.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		settings: settingsList,
	});
}

exports.admineditSettingPage = async function(req, res){
	Setting.findOne({ 'id' :  1}, function(err, settingdata){
		if(err){
			req.flash('error', 'Error : something is wrong while changing settings');
			res.redirect('/errorpage');
		}else{			
    		res.render('admin/editsettings', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session,
				settings:settingdata,
			});
		}
   	});
}

exports.adminupdateSetting = function(req, res){
	var setting_id = parseInt(req.body.settings_id);
	Setting.findOne({id:setting_id}, function(err, setting) {
  		if (!setting){
    		req.flash('success', 'Could not find Settings');
    		res.redirect('/errorpage');
  		}
  		else
  		{   
    	    setting.site_title = req.body.site_title;
    	    setting.admin_email = req.body.admin_email;
    	    setting.developer_email = req.body.developer_email;
    	    setting.monthly_featuredmemberhip_token = parseInt(req.body.monthly_featuredmemberhip_token);
    	    setting.monthly_featuredmemberhip_flat = parseInt(req.body.monthly_featuredmemberhip_flat);
    	    setting.yearly_featuredmemberhip_token = parseInt(req.body.yearly_featuredmemberhip_token);
    	    setting.yearly_featuredmemberhip_flat = parseInt(req.body.yearly_featuredmemberhip_flat);
    	    setting.token_price_rate = parseFloat(req.body.token_price_rate);
    	    setting.vat_percentage = parseInt(req.body.vat_percentage);
		    setting.save(function(err) {
		      if (err){
	    	    req.flash('success', 'Something went wrong while updating settings');
		        res.redirect('/errorpage');
		    }
		    else{
    			req.flash('success', 'Settings updated successfully.');
		        res.redirect('/admin/settings');
		    	}
    		});
  		}
	});
}