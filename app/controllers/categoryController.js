
var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var models      = require('../../app/models/revstance_models');
var User = models.User;
var Category = models.Category;
var Properties = models.Property;
var dynamicmail  = require('../../app/controllers/dynamicMailController');
var tokenallocate   = require('../../app/controllers/tokenController');

//#static pages
exports.addCategoryPage = function(req, res) {
	res.render('admin/addcategory', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
		categories:'',
	});
}

/*Delete Category From Admin Side*/
exports.deleteCategoryPage = function(req, res) {
	cat_id = req.param('delete');
	cat_id = parseInt(req.param('delete'));
	console.log(cat_id);
	
	//Properties.findOne({'category_id':cat_id}, function(err, ci){
	Properties.find({'category_id':{ $in:[cat_id] }}, function(err, ci){
		var status=0;
		if(ci.length > 0){
			ci.forEach(function(category){
				if(category){
					status++;
					return false;
				}
				/*var cat_array = (category.category_id).split();
				cat_array.forEach(function(cat){
					if(cat==cat_id){
						status++;
					}
				});*/
			});
		}
		if(status==0){
			/*Category.deleteOne({ 'id' :  cat_id}, function(err){*/
			 		req.flash('success', 'Category deleted successfully');
	         	res.redirect('/admin/categories');
			/*});*/
		}
		else{
			req.flash('error', 'Oops.. Category linked with locations');
    		res.redirect('/admin/categories');
		}
	});
}


/*Edit Category From Admin Side*/
exports.editCategoryPage = function(req, res) {
		var category_id = req.param('edit');
		Category.findOne({ 'id' :  category_id}, function(err, category_name){
			if(err){
				req.flash('error', 'Error : something is wrong while edit category');
				res.redirect('/errorpage');
			}else{				
	    		console.log(category_name);
	    		res.render('admin/addcategory', {
					error : req.flash("error"),
					success: req.flash("success"),
					session:req.session,
					categories:category_name,
				});
			}
   	});
}

/*Store New Category From Admin Side*/
exports.storeCategoryPage = function(req, res) {
		cat_name = (req.body.category_name).trim();
		Category.findOne({ 'category_name' :  new RegExp('^' +cat_name+ '$', 'i')}, function(err, category_name) {

			if(err){
				req.flash('error', 'Error : something is wrong while add category');
				res.redirect('/errorpage');
			}
			else{
				if (category_name) {
	        		console.log('category already exitst');
			        req.flash('error', 'Category already exist');
					res.redirect('/admin/categories');
		    	} else {
		    		Category.find().sort([['id', 'descending']]).limit(1).exec(function(err, categorydata) {

		    		var newCategory = new Category();
					//var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
					var day = getDate();
					newCategory.category_name = cat_name;
				    newCategory.status = parseInt(1);
				    newCategory.user = req.session.user._id;
				    newCategory.created_by = req.session.user.id;
				    newCategory.created_date = day;
				    newCategory.updated_date = day;
				    if(categorydata.length > 0){
				    	newCategory.id = categorydata[0].id+1;
				    }else{
				    	newCategory.id = 1;
				    }
				    newCategory.save(function(err) {
			        if (err)  return (err);			       
			        	req.flash('success', 'Category has been added successfully.');
			        	res.redirect('/admin/categories');
			    	});
		    	  }); 
		    	}
			}        	
		});
}
/*Store New Category From User Side*/
exports.storeUserCategoryPage = function(req, res) {
		cat_name = (req.body.category_name).trim();
		 console.log(req.body);
		// process.exit();
		Category.findOne({ 'category_name' :  new RegExp('^' +cat_name+ '$', 'i')}, function(err, category_name) {

			if(err){
				if(req.body.req_type=='web'){
					req.flash('error', 'something is wrong while fetching category');
					res.redirect('/errorpage');
				}else{
					res.send({'status' : 'false', 'message' : 'something is wrong while fetching category', 'data': null});
				}
			}
			else{
				if (category_name) {
					if(req.body.req_type=='web'){
						req.flash('error', 'Category Already Exists');
						res.redirect('/request-category');
					}else{
						res.send({'status' : 'exist', 'message' : 'Category Already Exists', 'data': null});
					}
		    	} else {
		    		Category.find().sort([['id', 'descending']]).limit(1).exec(function(err, categorydata) {

		    		var newCategory = new Category();
					//var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
					var day = getDate();
					newCategory.category_name = cat_name;
				    newCategory.status = parseInt(0);
				    newCategory.created_date = day;
				    newCategory.user = req.session.user._id;
				    newCategory.created_by = req.session.user.id;
				    newCategory.category_desc = req.body.category_desc;
				    newCategory.updated_date = day;
				    console.log(req.session.user._id);
				    if(categorydata.length > 0){
				    	newCategory.id = categorydata[0].id+1;
				    }else{
				    	newCategory.id = 1;
				    }
				    newCategory.save(function(err) {
			        if (err){
			        	if(req.body.req_type=='web'){
			        		req.flash('error', 'something is wrong while adding category');
							res.redirect('/errorpage');
			        	}else{
			        		res.send({'status' : 'false', 'message' : 'something is wrong while adding category', 'data': null});
			        	}

			        }else{
				        if(req.body.req_type=='web'){
				        	req.flash('success', 'Thank You! Your request has been submitted successfully');
							res.redirect('/request-category');
				        }else{
				        	res.send({'status' : 'true', 'message' : 'Category Added Successfully. it will be display after admin approval', 'data' : null});
				        }
			        }
			    	});
		    	  }); 
		    	}
			}        	
		});
}

/*Update Category From Admin Side*/
exports.updateCategoryPage = function(req, res) {
 	Category.findOne({id:req.body.category_id}, function(err, p) {
 		if(err){
			req.flash('error', 'Error : something is wrong while updating category');
			res.redirect('/errorpage');
		}
		else{			
			if (!p){
	            req.flash('error', 'Category Not Found..');
	            res.redirect('/errorpage');
        	}
	        else 
	        {   
	        	console.log('test1');
	        	var ex_user = (p.user);
	        	var existing = (p.category_name).trim().toLowerCase();
	        	var new_cat = (req.body.category_name).trim().toLowerCase();

	        	console.log("Exist"+existing);
	        	console.log("New"+new_cat);
	        	console.log("exuser"+ex_user);
	        	/*if(existing!=new_cat)
	        	{*/
	        		Category.findOne({category_name: new RegExp('^' +req.body.category_name.trim() + '$', 'i'),user:{$ne:ex_user}}, function(err, category) {
	        			if (category){
	        				req.flash('error', 'Category already exist');
	                		res.redirect('/admin/categories');
	        			}
	        			else{
	        				console.log('test2');
	        				Category.findOne({id:req.body.category_id}, function(err, cate) {
	        					if(err){
									req.flash('success', 'Oops. Something went wrong..');
							        console.log('error');
	        					}else{
	        						console.log('test3');
	        						cate.category_name = req.body.category_name;
				            		cate.save(function(result) {
						                if (result){
							                req.flash('success', 'Oops. Something went wrong..');
							                console.log('error');
						           		}
					            		else
					            		{
					                		req.flash('success', 'Category has been updated successfully.');
					                		console.log('success');
					                		res.redirect('/admin/categories');
					                	}
				                	});
				            	}
				        	});
				        }
        			})
        		/*}else{
        			req.flash('success', 'Category has been updated successfully.');
					 res.redirect('/admin/categories');
        		}*/
        	}
        }    		      
	}); 	
}

exports.acceptCategoryPage = function(req,res) {
	cat_id = req.query.id;

	Category.findOne({id:cat_id}, function(err, category) {
 		if(err){
 			req.flash('error', 'Error : something is wrong while fetching category list');
			res.redirect('/errorpage');
		}
		else{
			if (category){
				var userid = category.user;
				User.findOne({_id:userid},function(err,userdata){
					if(err){
			 			req.flash('error', 'Error : something is wrong while user of category list');
						res.redirect('/errorpage');
					}else{
						category.status = 1;
						category.save(function(err) {
			                if (err){
			                	req.flash('error', 'Error : something is wrong while accepting category request');
								res.redirect('/errorpage');
			           		}
		            		else
		            		{
		            		User.findOne({_id:category.user}, function(err, userdata){
            					var tokenData = {
			    					sender: req.app.locals.admin_account_id,
			    					receiver: userdata._id,
			    					amount: 1,
			    					operation: 'plus',
			    					type: 1, //type 1 = token and type 2 = point
			    					description: 'You earned 1 Token for Add Category'
			    		}

		            	tokenallocate.issueToken(tokenData);
            			
            			});
		            			var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 9
				            	}

		            			dynamicmail.sendMail(sendmail);

		            			req.flash('success', 'Category request has been accepted successfully');
			         			res.redirect('/admin/categories');
		                	}
		                });
					}
				})
			}
		}
	});

}

exports.rejectCategoryPage = function(req,res) {
	cat_id = req.query.id;

	Category.findOne({id:cat_id}, function(err, category) {
 		if(err){
 			req.flash('error', 'Error : something is wrong while fetching category list');
			res.redirect('/errorpage');
		}
		else{
			if (category){
				var userid = category.user;
				User.findOne({_id:userid},function(err,userdata){
					if(err){
			 			req.flash('error', 'Error : something is wrong while user of category list');
						res.redirect('/errorpage');
					}else{
			            Category.deleteOne({ 'id' :  cat_id}, function(err){

							var sendmail = {
			            		receiver_name: userdata.first_name,
			            		receiver_email: userdata.mail,
			            		email_type: 10
			            	}

	            			dynamicmail.sendMail(sendmail);
						 	req.flash('success', 'Category request has been rejected successfully');
				         	res.redirect('/admin/categories');
						});
					}
				})
			}
		}
	});
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }


    
