var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var models      = require('../../app/models/revstance_models');
var User = models.User;
var Category = models.Category;
var Property = models.Property;
var Reviews  = models.Review;
var Claim 	 = models.Claim;

exports.removeClaim = function(req, res) {
	var user_id = req.session.user.id;
	Claim.remove({ property_id: req.query.id, user_id:user_id }, function(err) {
	    if (err) {
	        req.flash('success', 'Location claim remove failed.');
			backURL=req.header('Referer') || '/search';
			res.redirect(backURL);
	    }
	    else {
				req.flash('success', 'Location claim removed successfully.');
				backURL=req.header('Referer') || '/search';
				res.redirect(backURL);
    	    }
	});
}

exports.approvClaim = function(req, res) {
	console.log("Claimn Id "+req.query.id);
	Claim.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find claim information');
    		res.redirect('/admin/claimed-locations');
  		}
  		else 
  		{  
    	    property_id = p.property_id;
    	    new_user_id = p.user_id;
    	  	Property.updateOne({id: property_id},{ $set:{'user_id': new_user_id}}, function(err,done){
	        	if (err){
	        		req.flash('success', 'Error : something is wrong in claim property');	
	        	}
		    	Claim.update({property_id:property_id,status:0},{status: 2},{multi: true}, function(){
	        		Claim.remove({ id: req.query.id }, function(err) {
				    if (err) {
				        req.flash('success', 'Location claim approved successfully.');
						backURL=req.header('Referer') || '/search';
						res.redirect(backURL);
				    }
				    else {
							req.flash('success', 'Location claim approved successfully.');
							res.redirect('/admin/claimed-locations');	
			    	    }
			    	});
				});							
			});
	    }		  		
	});
}

exports.ignoreClaim = function(req, res) {	
	Claim.find({ id: req.query.id }, function(err, claim){
		Claim.update({id:req.query.id},{status: 2},{multi: true}, function(err){  	    	
			req.flash('success', 'Location claim ignored successfully.');
			res.redirect('/admin/claimed-locations');	
	    });
	});
}

exports.getClaimedLocations = async function(req,res){
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='first_name';
	let ordered_sort = 0;
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
		ordered_sort=req.query.ordered_sort;
	}

	var category_filter = {};
	var filters = {};
	if(req.query.category_filter) {	filters.category_filter=req.query.category_filter;	}

	let claimedpropertiesData = await Claim.find({status:0}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail id contact_number'}).populate({path: 'property', model: 'Property',select:'id property_name category_id user'}).skip(skip).limit(perpage).sort(ordered_column).exec();
	total_count = await Claim.find({status:0}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail id contact_number'}).populate({path: 'property', model: 'Property',select:'id property_name category_id user'}).count();
	page_count = Math.ceil(total_count/perpage);
	let existinguser = '';
	claimedLocationsList = [];
	let user_ids = [];
	claimedpropertiesData.forEach(function(cproperty) {
		user_ids.push(cproperty.property.user);
	});
	let usersData = await User.find({_id:{$in: user_ids}}).select('first_name last_name mail id');
	var existingusers = [];
	usersData.forEach(function(usr){
		existingusers[usr._id]=usr;		
	});
	console.log(existingusers);
	claimedpropertiesData.forEach(function(cproperty) {
		claimedLocation = {};
   		claimedLocation.id=cproperty.id;
   		claimedLocation.property_id=cproperty.property_id;
   		claimedLocation.property_name=cproperty.property.property_name;
   		claimedLocation.category=cproperty.property.category_id;
   		claimedLocation.contact_number=cproperty.user.contact_number;
   		claimedLocation.exiting_owner_id=existingusers[cproperty.property.user._id].id;
   		claimedLocation.exiting_owner=existingusers[cproperty.property.user._id].first_name;
   		claimedLocation.mail=cproperty.user.mail;
   		claimedLocation.new_owner_id=cproperty.user_id;
   		claimedLocation.new_owner_name=cproperty.user.first_name+' '+cproperty.user.last_name;
   		claimedLocationsList.push(claimedLocation);
   		console.log(claimedLocation.exiting_owner);
	});
	let category = await Category.find({});
	categories = [];
	category.forEach(function(category){
		categories[category.id]=category;
	});
	res.render('admin/allClaimedProperties.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),					
		property: claimedLocationsList,
		categories: categories,
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

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }  
