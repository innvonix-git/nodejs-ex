let numeral = require('numeral');
let bcrypt = require('bcrypt-nodejs');
let mongoose = require('mongoose');
let dateFormat = require('dateformat');
let fs = require('fs');
let moment = require('moment');
let thumb = require('node-thumbnail').thumb;
let models = require('../../app/models/revstance_models');
let User = models.User;
let Property = models.Property;
let Category = models.Category;
let Review = models.Review;
let Claims = models.Claim;
let FlaggedReview = models.Flag;
let RecentActivity = models.RecentActivity;
let Like = models.Like;
let Badge = models.Badge;
let Follower = models.Follower;
let Membership = models.Membership;
let ReportFlag = models.ReportFlag;
let StanceLevel = models.StanceLevel;
let TokenLog = models.TokenLog;
let constants = require('../../config/constants');
let dynamicmail = require('../../app/controllers/dynamicMailController');
let tokenallocate = require('../../app/controllers/tokenController');
let activities = require('../../app/controllers/activityController');

exports.showUserMembership = async function (req, res, next) {
	let memberships = await Membership.find({ 'status': parseInt(1) });
	let mem = await Membership.findOne({ 'id': parseInt(1) });
	let profile = await User.findOne({ 'id': req.session.user.id }).
		populate({ path: 'membership', model: 'Membership', select: 'membership_title id' }).exec();
		
	Membership.findOne({ _id: profile.next_membership_plan }, function (error, member) {
		res.render('user_membership', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			memberships: memberships,
			user: profile,
			next_membership_plan: member.membership_title,
			next_membership_plan_cost: member.membership_cost,
			basic_plan : mem.membership_title,
			basic_plan_cost : mem.membership_cost
		});
	})
}

exports.feedPage = async function (req, res) {
	let allactivities = await RecentActivity.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $lookup: { from: "properties", localField: "property", foreignField: "_id", as: "prop" } }, { $lookup: { from: "reviews", localField: "property", foreignField: "_id", as: "prop" } }, { $unwind: "$user" }, { $unwind: "$prop" }]).exec();

	//properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'property_name':ordered_sort}).skip(skip).limit(perpage).exec();
	console.log(allactivities);
	res.render('feed.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		allactivities: allactivities
	});
}
exports.shopPage = async function (req, res) {

	let allactivities = await RecentActivity.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $lookup: { from: "properties", localField: "property", foreignField: "_id", as: "prop" } }, { $lookup: { from: "reviews", localField: "property", foreignField: "_id", as: "prop" } }, { $unwind: "$user" }, { $unwind: "$prop" }]).exec();

	//properties = await Property.aggregate([{ $lookup: { from: "users", localField: "user", foreignField:"_id", as: "user"}}, { $lookup: { from: "categories", localField: "category", foreignField:"_id", as: "category"} }, { $unwind: "$user"} ,{$match : {$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{'user.mail': { "$regex": keyword, "$options": "i" }},{'user.contact_number': { "$regex": keyword, "$options": "i" }},{'user.first_name': { "$regex": keyword, "$options": "i" }},{'user.last_name': { "$regex": keyword, "$options": "i" }}]},{"status": {"$in": status}}]}}]).collation({ locale: "en" }).sort({'property_name':ordered_sort}).skip(skip).limit(perpage).exec();
	console.log(allactivities);
	
	res.render('shop.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		allactivities: allactivities
	});
}
exports.showUserTokenLogPage = async function (req, res) {
	console.log(req.query.daterange);

	let page = 0;
	let skip = 0;
	let perpage = 10;
	let tokensList = [];
	let total_count = 0;
	let ordered_column = 'created_date';
	let ordered_sort = -1;
	let tokenfilter = 'mostrecent';
	let tokens = [];
	let sortClause = {};
	let loginuser = req.session.user._id;
	let keyword = '';
	let daterange = '';

	if (req.query.perpage) {
		perpage = parseInt(req.query.perpage);
	}

	if (req.query.daterange) {
		daterange = req.query.daterange;
		let rangedate = req.query.daterange.split('-');
		console.log(rangedate);
		let from_date = rangedate[0];
		from_date = new Date(from_date).toLocaleString("en-US", { timeZone: "America/New_York" });
		console.log(from_date);

		let end_date = rangedate[1];
		end_date = new Date(end_date);
		console.log(end_date);
	}

	if (req.query.page) {
		page = parseInt(req.query.page);
		if (page < 0) page = 0;
		skip = page * perpage;
	}

	if (req.query.ordered_column) {
		ordered_column = req.query.ordered_column;
	}

	if (req.query.tokenfilter) {
		if (req.query.tokenfilter == 'mostrecent') {
			tokenfilter = req.query.tokenfilter.trim().toLowerCase();
		} else {
			tokenfilter = req.query.tokenfilter.trim().toLowerCase();
		}
	}

	//sortClause.created_date = ordered_sort;
	if (tokenfilter == 'daterange' && req.query.daterange) {
		tokens = await TokenLog.find({ $and: [{ $or: [{ created_date: { "$gte": new Date(from_date), "$lte": new Date(end_date) } }] }, { user: loginuser }] }).collation({ locale: "en" }).sort(sortClause).skip(skip).limit(perpage).exec();

		total_count = await TokenLog.find({ $and: [{ $or: [{ created_date: { "$gte": new Date(from_date), "$lte": new Date(end_date) } }] }, { user: loginuser }] }).collation({ locale: "en" }).count();
	} else {
		tokens = await TokenLog.find({ $and: [{ $or: [{ description: { "$regex": keyword, "$options": "i" } }] }, { user: loginuser }] }).collation({ locale: "en" }).sort(sortClause).skip(skip).limit(perpage).exec();

		total_count = await TokenLog.find({ $and: [{ $or: [{ description: { "$regex": keyword, "$options": "i" } }] }, { user: loginuser }] }).collation({ locale: "en" }).count();
	}

	page_count = Math.ceil(total_count / perpage);
	tokens.forEach(function (token) {
		tokensList.push(token);
	});

	res.render('user-tokenlog.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		filter: tokenfilter,
		tokens: tokensList,
		page: page,
		perpage: perpage,
		total_count: total_count,
		total_pages: page_count,
		keyword: keyword,
		counter: total_count,
		daterange: daterange
	});

}

exports.showUserProfile = async function (req, res, next) {
	let myparams = req.url;
	let api_response = {};
	let userid = parseInt(req.params.userid);
	let isFlaggedUser = 0;
	let isFollowed = 0;
	let ordered_sort = 1;
	let followersName = [];
	let followingsName = [];
	let isFollower = [];
	let calltype = '';
	let loggedIn = '';

	if (myparams.indexOf('api') > 0) {
		let calltype = 'api';
		usersId = 1;
	} else {
		let calltype = 'web';
		usersId = userid;
	}
	if (req.session.user) {
		let loggedIn = req.session.user._id;
	}

	let profile = await User.findOne({ 'id': userid }).populate({ path: 'membership', model: 'Membership', select: 'membership_title' }).exec();
	followers = await Follower.countDocuments({ type: 1, 'following_user': profile._id }).exec();
	let followings = await Follower.countDocuments({ type: 1, 'follower_user': profile._id }).exec();
	let activities = await RecentActivity.find({ user: profile._id }).populate({ path: 'target_user', select: 'first_name last_name id' }).populate({ path: 'property', select: 'id slug property_name' }).sort({ 'id': -1 }).limit(10);
	const ObjectId = mongoose.Types.ObjectId;
	let user_id = req.query.userid;


	let allFollowers = await Follower.find({ following_user: ObjectId(profile._id) }).select('follower_user').exec();
	allFollowers.forEach(function (data) {
		console.log(data);
		Follower.aggregate([{ $match: { follower_user: ObjectId(data.follower_user) } }, {
			$lookup: {
				from: "users", localField: "follower_user", foreignField: "_id",
				as: "user"
			}
		}, { $unwind: "$user" }]).collation({ locale: "en" })
			.sort({ 'user.first_name': ordered_sort }).exec(function (err, followersdata) {
				if (err) {
					console.log(err);
					req.flash('error', 'Something Went wrong while fetching followers data');
					res.redirect('/errorpage');
				}
				else {
					followersName.push({ 'fullname': followersdata[0].user.first_name + " " + followersdata[0].user.last_name, '_id': followersdata[0].user._id });
				}

			});

	});

	let allFollowings = await Follower.find({ type: 1, follower_user: ObjectId(profile._id) }).select('following_user').exec();
	allFollowings.forEach(function (data) {
		Follower.aggregate([{
			$match: {
				$or: [{
					$and: [{ following_user: ObjectId(data.following_user) },
					{ follower_user: ObjectId(profile._id) }]
				}]
			}
		}, {
			$lookup: {
				from: "users", localField: "following_user", foreignField: "_id",
				as: "user"
			}
		}, { $unwind: "$user" }]).collation({ locale: "en" })
			.sort({ 'user.first_name': ordered_sort }).exec(function (err, followingsdata) {
				if (err) {
					console.log(err);
					req.flash('error', 'Something Went wrong while fetching followers data');
					res.redirect('/errorpage');
				}
				else {
					followingsName.push({ 'fullname': followingsdata[0].user.first_name + " " + followingsdata[0].user.last_name, '_id': followingsdata[0].user._id, 'profile_photo': followingsdata[0].user.profile_photo });
				}
			});
	});

	if (req.session.user && req.session.user.user_type == 1) {
		loggedIn = req.session.user._id;
		let isFollow = await Follower.find({ type: 1, follower_user: ObjectId(loggedIn) }).select('following_user').exec();
		isFollow.forEach(function (data) {
			isFollower.push(data.following_user);
		});
		loggedInUserId = req.session.user._id;
	} else {
		loggedInUserId = '';
	}

	profile.isFollower = isFollower;
	console.log(profile.isFollower);
	profile.loggedIn = loggedIn;
	profile.followersName = followersName;
	profile.followingsName = followingsName;
	profile.followers = followers;
	profile.followings = followings;
	profile.activities = activities;
	let stanceBalance = parseInt(profile.point_balance);
	let stanceObj = await StanceLevel.find();
	let flag = 0;
	stanceObj.forEach(function (stanceData) {
		if (stanceBalance >= parseInt(stanceData.start) && stanceBalance >= parseInt(stanceData.ends)) {
			profile.stance = stanceData.stancename;
			flag++;
		}
	});
	if (flag == 0) {
		profile.stance = stanceObj[0].stancename;
	}
	if (req.session.user) {
		let flaggedUsers = [];
		let reportflag = await ReportFlag.find({ report_type: parseInt(1), user: req.session.user._id });
		reportflag.forEach(function (reportuser) {
			flaggedUsers.push(reportuser.spam_user);
		});
		if (flaggedUsers.includes(profile.id)) {
			isFlaggedUser = 1;
		}
	}
	let followedUsers = [];
	if (req.session.user) {
		let followedUser = await Follower.find({ following_user: profile._id, follower_user: req.session.user._id });
		followedUser.forEach(function (users) {
			followedUsers.push(users.following_user);
		});
		if (!followedUser.length == 0) {
			if (followedUsers.includes(followedUser[0].following_user)) {
				isFollowed = 1;
			}
		}
		loggedInUserId = req.session.user._id;
	} else {
		loggedInUserId = '';
	}

	if (followers >= 1000) {
		let user_influencer = await User.find({ 'id': userid });
		user_influencer.forEach(function (userdata) {
			userdata.is_influencer = parseInt(1);

			userdata.save(function (err) {
				if (err) {
					req.flash('error', 'Something Went Wrong while update influencer tag');
					res.redirect('/errorpage');
				}
				else {
					console.log("User got Influencer tag");
				}
			});
		});
	}

	if (!profile) {
		req.flash('error', 'Error : No such user found in system.');
		res.redirect('/errorpage');
	}
	if (calltype == 'api') {
		api_response.message = 'Profile retrived.';
		api_response.code = 200;
		api_response.status = true;
		api_response.profile = profile;
		res.send(api_response);
	} else {
		console.log(profile);
		res.render('showUserProfile', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			user: profile,
			isFlaggedUser: isFlaggedUser,
			isFollowed: isFollowed,
			loggedInUserId: loggedInUserId,
		});
	}
}

exports.followUser = async function (req, res, next) {
	let userId = req.params.id;
	let isFlaggedUser = 0;
	let isFollowed = 0;
	console.log(userId);
	try {
		let profile = await User.findOne({ '_id': userId }).populate({ path: 'membership', model: 'Membership', select: 'membership_title' }).exec();

		if (req.session.user) {
			let flaggedUsers = [];
			let reportflag = await ReportFlag.find({ report_type: parseInt(1), user: req.session.user._id });
			reportflag.forEach(function (reportuser) {
				flaggedUsers.push(reportuser.spam_user);
			});
			if (flaggedUsers.includes(profile.id)) {
				isFlaggedUser = 1;
			}
		}
		if (req.session.user) {
			let followedUsers = [];
			let followedUser = await Follower.find({ following_user: profile._id, follower_user: req.session.user._id });
			followedUser.forEach(function (users) {
				followedUsers.push(users.following_user);
			});
			if (!followedUser.length == 0) {
				if (followedUsers.includes(followedUser[0].following_user)) {
					isFollowed = 1;
				}
			}
		}
		Follower.find().sort([['id', 'descending']]).limit(1).exec(function (err, followerData) {

			if (err) {
				res.send({ 'status': false, 'backurl': req.originalUrl });
			}
			let newFollower = new Follower();
			let day = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
			if (followerData.length == 0)
				newFollower.id = 1;
			else
				newFollower.id = followerData[0].id + 1;
			newFollower.follower_user = req.session.user._id;
			newFollower.following_user = userId;
			newFollower.type = parseInt(1);
			newFollower.status = parseInt(1);
			newFollower.created_date = day;
			newFollower.updated_date = day;

			newFollower.save(function (err) {
				if (err) {
					console.log(err);
					res.redirect('/errorpage');
				}
				else {

					let activityData = {
						user: req.session.user._id,
						description: 'started following ',
						property: null,
						target_user: newFollower.following_user
					}

					activities.storeRecentActivity(activityData);

					Follower.findOne({ following_user: req.session.user._id, follower_user: newFollower.following_user }, function (err, followerData) {
						if (followerData == null) {
							console.log("No cross followers");
						}
						else {
							let activityData = {
								user: newFollower.following_user,
								description: 'has new follower ',
								property: null,
								target_user: req.session.user._id
							}
							activities.storeRecentActivity(activityData);
						}

					});

					backURL = req.header('Referer') || '/search';
					res.redirect(backURL);
				}
			});
		});
	} catch (err) {
		req.flash('error', 'Error: ' + err.type + ' : ' + err.message);
		res.redirect('/errorpage');
	}
}

exports.unfollowUser = async function (req, res, next) {
	let userId = req.params.id;
	let isFlaggedUser = 0;
	let isFollowed = 0;
	console.log(userId);
	try {
		let profile = await User.findOne({ '_id': userId }).populate({ path: 'membership', model: 'Membership', select: 'membership_title' }).exec();
		if (req.session.user) {
			let flaggedUsers = [];
			let reportflag = await ReportFlag.find({ report_type: parseInt(1), user: req.session.user._id });
			reportflag.forEach(function (reportuser) {
				flaggedUsers.push(reportuser.spam_user);
			});
			if (flaggedUsers.includes(profile.id)) {
				isFlaggedUser = 1;
			}
		}

		let unfollowUser = await Follower.deleteOne({ following_user: profile._id, follower_user: req.session.user._id });
		if (req.session.user) {
			let followedUsers = [];
			let followedUser = await Follower.find({ following_user: profile._id, follower_user: req.session.user._id });
			followedUser.forEach(function (users) {
				followedUsers.push(users.following_user);
			});
			if (!followedUser.length == 0) {
				if (followedUsers.includes(followedUser[0].following_user)) {
					isFollowed = 1;
				}
			}
		}
		backURL = req.header('Referer') || '/search';
		res.redirect(backURL);
	} catch (err) {
		req.flash('error', 'Error: ' + err.type + ' : ' + err.message);
		res.redirect('/errorpage');
	}

}

exports.followLocation = async function (req, res, next) {
	let propertyId = req.params.id;
	let counter = 0;
	let claimId = '';
	let perPage = 5;
	let userId = 0;
	let filter = {};
	let claimStatus = 0;
	let page = 0;
	let keyword = '';
	let isFlaggedLocation = 0;
	let otherClaimStatus = 0;
	let isFollowed = 0;

	if (req.session.user) {
		userId = req.session.user.id;
	}

	if (req.query.keyword) {
		keyword = req.query.keyword;
	}
	try {
		//get particular property data
		let property = await Property.findOne({ '_id': propertyId }).populate({ model: 'User', path: 'user', select: 'id first_name last_name mail contact_number user_type status' }).populate({ model: 'Category', path: 'category', select: 'id category_name' }).exec();
		if (property.length <= 0) {
			req.flash('error', 'Could not find location');
			backURL = req.header('Referer') || '/search';
			res.redirect(backURL);
		}
		if (property.status != 1) {
			if (req.session.user) {
				if (req.session.user._id != property.user) {
					req.flash('error', 'Could not find location');
					backURL = req.header('Referer') || '/search';
					res.redirect(backURL);
				}
			} else {
				req.flash('error', 'Could not find location');
				backURL = req.header('Referer') || '/search';
				res.redirect(backURL);
			}
		}
		let claims = await Claims.find({ status: 0, property_id: property.id });
		if (claims.length > 0) {
			claims.forEach(function (cliam) {
				if (cliam.user_id == userId && cliam.property_id == propertyDetails.id) {
					claimStatus = 1;
					claimId = cliam.id;
				}
			});
		}
		let categoriesObj = await Category.find({});
		let categories = [];
		categoriesObj.forEach(function (cate) {
			categories[cate.id] = (cate);
		});
		userIds = [];
		userIds.push(property.user);
		counter = await Review.countDocuments({ property_id: property.id });
		let reviewList = await Review.find({ property_id: property.id }).limit(perPage).skip(perPage * page).exec();
		property.reviews = [];
		reviewList.forEach(function (review) {
			userIds.push(review.user);
		});
		let users = await User.find({ '_id': { $in: userIds } });
		let usersList = [];
		users.forEach(function (user) {
			usersList[user.id] = user;
		});
		property.category_name = getCategoryName(property.category_id, categories);
		property.user_type = usersList[property.user_id].user_type;
		property.user_status = usersList[property.user_id].status;
		property.contact_number = usersList[property.user_id].contact_number;
		property.first_name = usersList[property.user_id].first_name;
		property.last_name = usersList[property.user_id].last_name;
		property.mail = usersList[property.user_id].mail;
		property.total_reviews = counter;

		let avg_review_rating = 0;
		let review_types = { one: 0, two: 0, three: 0, four: 0, five: 0 };
		let i = 0;
		reviewList.forEach(function (review) {
			avg_review_rating += review.review_rating;
			if (review.review_rating == 1) review_types.one++;
			else if (review.review_rating == 2) review_types.two++;
			else if (review.review_rating == 3) review_types.three++;
			else if (review.review_rating == 4) review_types.four++;
			else if (review.review_rating == 5) review_types.five++;
		});
		reviewList.forEach(function (review) {
			property.reviews[i] = review;
			i++;
		});
		property.avg_review_rating = avg_review_rating / reviewList.length;
		property.review_types = review_types;
		if (req.session.user) {
			let spamlocation = await ReportFlag.find({ report_type: parseInt(2), user: req.session.user._id, property: parseInt(property.id) }).exec();
			if (spamlocation.length > 0) {
				isFlaggedLocation = 1;
			}
		}

		let location_id = property.id;
		console.log(location_id);
		Follower.find().sort([['id', 'descending']]).limit(1).exec(function (err, followerData) {

			if (err) {
				res.send({ 'status': false, 'backurl': req.originalUrl });
			}
			let newFollower = new Follower();
			let day = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
			if (followerData.length == 0)
				newFollower.id = 1;
			else
				newFollower.id = followerData[0].id + 1;
			newFollower.follower_user = req.session.user._id;
			newFollower.property = propertyId;
			newFollower.property_id = location_id;
			newFollower.type = parseInt(2);
			newFollower.status = parseInt(1);
			newFollower.created_date = day;
			newFollower.updated_date = day;

			newFollower.save(function (err) {
				if (err) {
					console.log(err);
					res.redirect('/errorpage');
				}
				else {
					Property.findOne({ _id: newFollower.property }, function (err, findpropertydata) {

						let activityData = {
							user: req.session.user._id,
							description: 'started following the location ',
							property: newFollower.property,
							target_user: null
						}

						activities.storeRecentActivity(activityData);
					});

					if (req.session.user) {
						let followedLocations = [];
						Follower.find({ property: propertyId, follower_user: req.session.user._id }, function (err, locations) {
							if (err) {
								req.flash('error', 'Could not find claim detail for property.');
								res.redirect('/admin/locations');
							}
							else {
								if (locations.length > 0) {
									followedLocations.push(locations[0].property);
								}
							}
							if (!locations.length > 0) {
								if (followedLocations.includes(locations[0].property)) {
									isFollowed = 1;
								}
							}
						});
					}

					backURL = req.header('Referer') || '/search';
					res.redirect(backURL);
				}
			});
		});
	} catch (err) {
		req.flash('error', 'Error: ' + err.type + ' : ' + err.message);
		res.redirect('/errorpage');
	}
}

exports.unfollowLocation = async function (req, res, next) {
	let propertyId = req.params.id;
	let counter = 0;
	let claimId = '';
	let perPage = 5;
	let userId = 0;
	let filter = {};
	let claimStatus = 0;
	let page = 0;
	let keyword = '';
	let isFlaggedLocation = 0;
	let otherClaimStatus = 0;
	let isFollowed = 0;

	if (req.session.user) {
		userId = req.session.user.id;
	}

	if (req.query.keyword) {
		keyword = req.query.keyword;
	}

	try {
		//get particular property data
		let property = await Property.findOne({ '_id': propertyId }).populate({ model: 'User', path: 'user', select: 'id first_name last_name mail contact_number user_type status' }).populate({ model: 'Category', path: 'category', select: 'id category_name' }).exec();

		let claims = await Claims.find({ status: 0, property_id: property.id });
		if (claims.length > 0) {
			claims.forEach(function (cliam) {
				if (cliam.user_id == userId && cliam.property_id == propertyDetails.id) {
					claimStatus = 1;
					claimId = cliam.id;
				}
			});
		}
		let categoriesObj = await Category.find({});
		let categories = [];
		categoriesObj.forEach(function (cate) {
			categories[cate.id] = (cate);
		});
		userIds = [];
		userIds.push(property.user);
		counter = await Review.countDocuments({ property_id: property.id });
		let reviewList = await Review.find({ property_id: property.id }).limit(perPage).skip(perPage * page).exec();
		property.reviews = [];
		reviewList.forEach(function (review) {
			userIds.push(review.user);
		});
		let users = await User.find({ '_id': { $in: userIds } });
		let usersList = [];
		users.forEach(function (user) {
			usersList[user.id] = user;
		});
		property.category_name = getCategoryName(property.category_id, categories);
		property.user_type = usersList[property.user_id].user_type;
		property.user_status = usersList[property.user_id].status;
		property.contact_number = usersList[property.user_id].contact_number;
		property.first_name = usersList[property.user_id].first_name;
		property.last_name = usersList[property.user_id].last_name;
		property.mail = usersList[property.user_id].mail;
		property.total_reviews = counter;

		let avg_review_rating = 0;
		let review_types = { one: 0, two: 0, three: 0, four: 0, five: 0 };
		let i = 0;
		reviewList.forEach(function (review) {
			avg_review_rating += review.review_rating;
			if (review.review_rating == 1) review_types.one++;
			else if (review.review_rating == 2) review_types.two++;
			else if (review.review_rating == 3) review_types.three++;
			else if (review.review_rating == 4) review_types.four++;
			else if (review.review_rating == 5) review_types.five++;
		});
		reviewList.forEach(function (review) {
			property.reviews[i] = review;
			i++;
		});
		property.avg_review_rating = avg_review_rating / reviewList.length;
		property.review_types = review_types;
		if (req.session.user) {
			let spamlocation = await ReportFlag.find({ report_type: parseInt(2), user: req.session.user._id, property: parseInt(property.id) }).exec();
			if (spamlocation.length > 0) {
				isFlaggedLocation = 1;
			}
		}

		let location_id = property.id;
		//console.log(location_id);
		let unfollowLocation = await Follower.deleteOne({ property: propertyId, follower_user: req.session.user._id });
		if (req.session.user) {
			let followedLocations = [];
			let followedLocation = await Follower.find({ property: property._id, follower_user: req.session.user._id }).exec();
			followedLocation.forEach(function (locations) {
				if (locations) {
					followedLocations.push(locations.property);
				}
				console.log(locations.property);
				console.log(followedLocations);
				if (locations) {
					if (followedLocations.includes(locations.property)) {
						isFollowed = 1;
					}
				}
			});
		}

		backURL = req.header('Referer') || '/search';
		res.redirect(backURL);

	} catch (err) {
		req.flash('error', 'Error: ' + err.type + ' : ' + err.message);
		res.redirect('/errorpage');
	}
}

exports.isLoggedIn = function (req, res, next) {
	if (req.session.user) { // req.session.passport._id
		if (req.session.user.user_type == 3) {
			res.redirect('/logout');
		}
		next();
	} else {
		res.redirect('/login');
	}
}

exports.showIndexPage = async function (req, res) {
	if(req.session.user){
		if(req.session.user.user_type==3){
			res.redirect('/admin/home');	
		}
	}
	if (req.session.user) {
		res.redirect('/home');
	} else {
		let a = await Property.countDocuments({ status: 1 });
		console.log(a);
		let b = await Property.countDocuments({ average_rating: 1, status: 1 });
		console.log(b);
		let c = await Property.countDocuments({ category_id: 2, status: 1});
		console.log(c);
		let d = await Property.countDocuments({ average_rating: 3 });
		console.log(d);
		let e = await Property.countDocuments({ average_rating: 4 });
		console.log(e);
		let f = await Property.countDocuments({ average_rating: 5 });
		console.log(f);

		let properties = await Property.find({ status: 1 }).distinct('area');
		let areas = [];
		properties.forEach(function (property) {
			let area = property.trim();
			if (area.length > 0) {
				areas.push(area);
			}
		});
		console.log(areas);
		res.render('index', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			areas: areas,
		});
	}
}

exports.checkForEmailPage = function (req, res) {
	let email = req.body.emailid;
	User.countDocuments({ mail: email }, function (err, p) {
		if (err) {
			res.send({ status: false, message: 'err' });
		} else {
			if (p > 0) {
				res.send({ status: false, message: 'exist' });
			}
			else {
				res.send({ status: true, message: 'Go Ahead' });
			}
		}
	});
}

exports.showFollowers = async function (req, res) {
	let ordered_sort = 1;
	let skip = 0;
	let perpage = 10;
	let followersList = [];

	const ObjectId = mongoose.Types.ObjectId;

	let user_id = req.query.userId;
	allFollowers = await Follower.aggregate([{
		$lookup: {
			from: "users", localField: "following_user", foreignField: "_id",
			as: "user"
		}
	}, { $unwind: "$user" }, { $match: { following_user: ObjectId(user_id) } }]).collation({ locale: "en" })
		.sort({ 'user.first_name': ordered_sort }).skip(skip).limit(perpage).exec();

	allFollowers.forEach(function (data) {
		followersList.push(data.follower_user);
	});

	backURL = req.header('Referer') || '/search';
	res.redirect(backURL);
}


exports.showFollowings = async function (req, res) {
	let ordered_sort = 1;
	let skip = 0;
	let perpage = 10;
	let followersList = [];

	const ObjectId = mongoose.Types.ObjectId;

	let user_id = req.query.userId;
	allFollowings = await Follower.aggregate([{
		$lookup: {
			from: "users", localField: "follower_user", foreignField: "_id",
			as: "user"
		}
	}, { $unwind: "$user" }, { $match: { follower_user: ObjectId(user_id) } }]).collation({ locale: "en" })
		.sort({ 'user.first_name': ordered_sort }).skip(skip).limit(perpage).exec();

	allFollowings.forEach(function (data) {
		followersList.push(data.follower_user);
	});

	backURL = req.header('Referer') || '/search';
	res.redirect(backURL);
}

exports.checkForAddReviewPage = function (req, res) {
	let user_id = req.session.user.id;
	let property_id = req.query.propertyId;
	let current_hour = Math.floor(Date.now() / 1000) / (60 * 60);
	let previous_hour = current_hour - 1;
	let previous_month = current_hour - (24 * 30);

	Review.countDocuments({ user_id: user_id, is_type: 0, property_id: property_id, timestamp: { $gt: previous_month, $lt: current_hour } }, function (err, p) {
		if (p > 0) {
			res.send({ status: false, message: 'propertylimit' });
		} else {
			Review.countDocuments({ user_id: user_id, is_type: 0, timestamp: { $gt: previous_hour, $lt: current_hour } }, function (err, c) {
				if (c >= 3) {
					res.send({ status: false, message: 'hourlimit' });
				}
				else {
					res.send({ status: true });
				}
			});
		}
	});
}

exports.showProfilePage = async function (req, res) {
	let myparams = req.url;
	let userId;
	let api_response = {};
	let badgesEarned = [];
	let calltype = 'web';
	if (myparams.indexOf('api') > 0) {
		calltype = 'api';
		userId = 1;
	} else {
		userId = req.session.user.id
	}
	let userMembership = [];
	let membershipTitle = await Membership.findOne({ _id: req.session.user.membership });

	User.findOne({ id: userId }, function (err, profile) {
		let isComplete = isProfileComplete(profile);
		console.log(isComplete);
		if (isComplete == 1) {
			Badge.findOne({ id: parseInt(1) }, function (err, data) {
				console.log(data);
				if (err) {
					req.flash('error', 'badge not found');
					res.redirect('/errorpage');
				}
				else {
					if (profile.badges.includes(data.badge_title)) {
						console.log("Already Earned This Badge");
					} else {
						badgesEarned = profile.badges;
						badgesEarned.push(data.badge_title);
						console.log(badgesEarned);
						profile.badges = badgesEarned;
						profile.save(function (err) {
							if (err) {
								req.flash('error', 'something went wrong while saving the badge');
								res.redirect('/errorpage');
							}
							else {
								req.flash('success', 'Profile Complete Badge Earned');
							}
						});
					}
				}
			});
		}

		if (err) {
			if (calltype == 'api') {
				api_response.message = '';
				api_response.code = 302;
				api_response.status = false;
				api_response.profile = {};
				res.send(api_response);
			} else {
				req.flash('error', 'Error : something is wrong with Profile Page');
				res.redirect('/errorpage');
			}
		}
		else {
			if (calltype == 'api') {
				api_response.message = 'Profile retrived.';
				api_response.code = 200;
				api_response.status = true;
				api_response.profile = profile;
				res.send(api_response);
			} else {
				res.render('profile', {
					error: req.flash("error"),
					success: req.flash("success"),
					session: req.session,
					membership: membershipTitle,
					user: profile,
				});
			}
		}
	});
}

exports.UpdateProfile = async function (req, res) {
	if (req.files && (req.files.length <= 10)) {
		let uploaded_files;
		uploaded = req.files.map(function (value) {
			return value.filename;
		});
		uploaded_files = uploaded.join();
		uploaded.map(function (a) {
			generateThumb('public/uploads/' + a, '345px', 'thumb_', 'public/uploads/thumbs/');
		});
		let user = await User.find({ id: req.session.user.id });
		user.forEach(function (profile) {
			if (profile) {
				profile.first_name = req.body.first_name;
				profile.last_name = req.body.last_name;
				profile.dob = req.body.dob;
				profile.gender = req.body.gender;
				profile.contact_number = req.body.contact_number;
				profile.ethnicity = req.body.ethnicity;
				profile.tag_line = req.body.tag_line;
				profile.profile_photo = uploaded_files;
				profile.address1 = req.body.address1;
				profile.area = req.body.area;
				profile.business_address1 = req.body.business_address1;
				profile.business_area = req.body.business_area;
				profile.city = req.body.city_name;
				profile.country = req.body.country_name;
				profile.postcode = req.body.post_code;

				profile.save(function (err) {
					if (err) {
						req.flash('success', 'Opps. Something went wrong..');
						console.log('error');
					}
					else {
						req.flash('success', 'Profile has been updated successfully');
						console.log('success');
						res.redirect('/MyProfile');
					}
				});
			}
		});
	}
}

exports.setProfesstionalBadge = function (req, res) {
	User.findOne({ id: req.body.userId }, function (err, userData) {
		if (err) {
			res.send({ 'status': 'false', 'message': 'something is wrong while updating professtional Badge', 'data': null });
		}
		else {
			if (userData) {

				if (req.body.is_checked == 'true') {
					userData.is_professional_badge = 1;
				} else {
					userData.is_professional_badge = 0;
				}
				userData.save(function (err) {
					if (err) {
						res.send({ 'status': 'false', 'message': 'Opps. Something went wrong', 'data': null });
					}
					else {
						res.send({ 'status': 'true', 'message': 'Profile has been updated successfully', 'data': null });
					}
				});
			}
		}
	});
	return true;
}

exports.setMembershipAutoRenewPage = function (req, res) {
	console.log(req.body);
	User.findOne({ id: req.body.userId }, function (err, userData) {
		if (err) {
			res.send({ 'status': 'false', 'message': 'something is wrong while updating auto renew', 'data': null });
		}
		else {
			if (userData) {
				if (req.body.is_checked == 'true') {
					userData.auto_renew = 1;
				} else {
					userData.auto_renew = 0;
					//userData.next_membership_plan = req.app.locals.default_membership;
				}
				userData.save(function (err) {
					if (err) {
						res.send({ 'status': 'false', 'message': 'Opps. Something went wrong..', 'data': null });
					}
					else {
						Membership.findOne({_id: userData.next_membership_plan},function(err,memberships){
							console.log(memberships);
							Membership.findOne({id: 1},function(err,basic_plan){
								console.log(basic_plan);
								if(userData.auto_renew==1){
									var c_mem_title = memberships.membership_title;
									var c_mem_cost = memberships.membership_cost;
								}else{
									var c_mem_title = basic_plan.membership_title;
									var c_mem_cost = basic_plan.membership_cost;
								}
							res.send({ 'status': 'true', 'message': 'auto renew updated successfully.', 'data': { 'title' : c_mem_title, 'cost' : c_mem_cost } });

							})

						})
					}
				});
			}
		}
	});
	return true;
}

exports.upgradeMembershipPage = function (req, res) {
	member_id = req.query.id;
	Membership.findOne({ id: member_id }, function (err, member) {
		if (err) {
			req.flash('error', 'Error : something is wrong while fetching requested membership');
			res.redirect('/errorpage');
		}
		if (member) {
			//get requested membership detail
			let requested_membership = member.membership_title;
			let requested_membership_id = member._id;
			let requested_membership_cost = parseInt(member.membership_cost);
			let userid = req.session.user.id;
			User.findOne({ id: userid }, function (err, userData) {
				if (err) {
					req.flash('error', 'Error : something is wrong while fetching membership');
					res.redirect('/errorpage');
				}
				if (userData) {
					//get user token balance
					let token_balance = userData.token_balance;
					let mid = userData.membership;
					Membership.findOne({ _id: mid }, function (err, currentmember) {
						if (err) {
							req.flash('error', 'Error : something is wrong while fetching membership');
							res.redirect('/errorpage');
						}
						if (currentmember) {
							let current_membership_id = currentmember.id;
							let current_membership = currentmember.membership_title;
							//If Enough token available then deduct token and upgrade membership
							if (token_balance >= requested_membership_cost) {
								//Upgrade Membership instantly on Pro Rated Day if current membership is Hummingbird
								if (current_membership_id == 1) {
									let proratedToken = {
										membership_cost: requested_membership_cost,
									}
									var deduct_token = tokenallocate.getProRatedToken(proratedToken);
									//userData.token_balance = userData.token_balance - deduct_token;
									var tokenData = {
										sender: req.session.user._id,
										receiver: req.app.locals.admin_account_id,
										amount: deduct_token,
										operation: 'plus',
										type: 1, //type 1 = token and type 2 = point
										description: 'Token deduct for membership'
									}
									tokenallocate.issueToken(tokenData);
									//userData.token_balance = userData.token_balance - deduct_token;
									userData.membership = requested_membership_id;
								}
								userData.auto_renew = 1;
								if (userData.auto_renew == 1) {
									userData.next_membership_plan = requested_membership_id;
								} else {
									userData.next_membership_plan = req.app.locals.default_membership;
								}
								userData.next_billing_cycle = getNextmonthFirstDay();
								userData.save(function (err) {
									if (err) {
										req.flash('error', 'Error : something is wrong while updating membership');
										res.redirect('/errorpage');
									} else {
										if (current_membership_id == 1) {
											req.flash('success', 'Membership upgraded successfully');
										} else {
											req.flash('success', 'Membership upgraded successfully, it will be affected from upcoming month');
										}
										res.redirect('/user-memberships');
									}
								})

							} else {
								req.flash('error', 'You do not have enough token to upgrade membership');
								res.redirect('/user-memberships');
							}
							console.log("selected " + requested_membership);
							console.log("current " + current_membership);
						}
					})
				}
			})
		}
	});
}

exports.showHomePage = async function (req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	if (req.session.user) {
		let properties = await Property.find({ status: 1 }).distinct('area');
		let areas = [];
		properties.forEach(function (property) {
			areas.push(property);
		});
		res.render('home', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			areas: areas,
		});
	}
}

exports.showAboutPage = function (req, res) {
	res.render('about', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}
exports.showContactUsPage = function (req, res) {
	res.render('contactus', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showTermsPage = function (req, res) {
	res.render('terms', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showPrivacyPage = function (req, res) {
	res.render('privacy', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showDeveloperHelpPage = function (req, res) {
	res.render('developer-help', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showLoginPage = function (req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('login', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session
		});
	}
}

exports.showSignupPage = function (req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('signup', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session
		});
	}
}

exports.showUserUpgradeMembership = function (req, res) {
	res.render('user-upgrademembership', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showUserActivity = function (req, res) {
	res.render('user-activity', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showUserRedeem = function (req, res) {
	res.render('user-redeem', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showUserOrderStatus = function (req, res) {
	res.render('user-orderstatus', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showUserReferral = function (req, res) {
	res.render('user-referral', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showUserSettings = function (req, res) {
	res.render('user-settings', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showRequestCategory = function (req, res) {
	res.render('request-category.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.showForgotPasswordPage = function (req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('forgotpass', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session
		});
	}
}

exports.logout = function (req, res) {
	req.logout();
	req.session.destroy(function (err) {
		res.redirect('/');
	});
}

exports.changePasswordPage = function (req, res) {
	res.render('changepassword', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session
	});
}

exports.sendForgotPasswordLinkPage = function (req, res) {
	console.log('send forgotpass link');

	User.findOne({ 'mail': req.body.email }, function (err, user) {
		if (err) {
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else {
			if (user) {
				if (user.status == 3) {
					req.flash('error', 'Sorry, your account is suspended');
					res.redirect('/forgotpassword');
				} else {
					let expiretime = new Date().getTime() + 60 * 60 * 1000;
					let forgot_code = bcrypt.hashSync(Math.floor((Math.random() * 99999999) * 54), null, null);
					User.updateOne({ 'id': user.id }, { $set: { 'forgot_hash': forgot_code, 'forgot_hash_date': expiretime } }, function (err, done) {
						if (err) {
							req.flash('success', 'Error : Error : something is wrong');
							res.redirect('/login');
						}
						let sendmail = {
							receiver_name: user.first_name,
							receiver_email: user.mail,
							forgot_code: forgot_code,
							email_type: 1
						}
						dynamicmail.sendMail(sendmail);
						req.flash('success', 'Password activation link sent to your email');
						res.redirect('/login');
					});
				}
			}
			else {
				console.log("email not exist");
				req.flash('error', 'This email address does not exists');
				res.redirect('/forgotpassword');
			}
		}
	});
}

exports.sendContactUsMailPage = function (req, res) {
	let sendmail = {
		receiver_name: req.body.contact_name,
		receiver_email: req.body.contact_email,
		contact_subject: req.body.contact_subject,
		contact_desc: req.body.contact_desc,
		email_type: 4
	}
	dynamicmail.sendMail(sendmail);
	let sendadminmail = {
		receiver_email: constants.adminemail,
		sender_name: req.body.contact_name,
		sender_email: req.body.contact_email,
		contact_subject: req.body.contact_subject,
		contact_desc: req.body.contact_desc,
		email_type: 5
	}
	dynamicmail.sendMail(sendadminmail);
	req.flash('success', 'We will contact you soon');
	res.redirect('/contactus');
}

exports.confirm = function (req, res) {
	console.log('Hello from activate');
	let hash = req.param('active_link');
	User.findOne({ 'active_hash': hash }, function (err, user) {
		if (err) {
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else {
			if (user) {
				if (user.status == 0) {
					User.updateOne({ 'active_hash': hash }, { $set: { 'status': 1 } }, function (err, done) {
						if (err) if (err) {
							req.flash('success', 'Error : Error : something is wrong');
							res.redirect('/login');
						}
						req.flash('success', 'Your email is verified, please login to access account');
						res.redirect('/login');
					});
				}
				else {
					req.flash('error', 'Your email is already verified, please login to access account');
					res.redirect('/login');
				}
			}
			else {
				console.log("hash not avail");
				req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

exports.addReviewPage = function (req, res) {
	let review_ids = [];
	let badgesEarned = [];
	let reviewList = [];
	let propertyList = [];
	if (req.files && (req.files.length <= 10)) {
		let uploaded_files;
		uploaded = req.files.map(function (value) {
			return value.filename;
		});
		uploaded_files = uploaded.join();
		uploaded.map(function (a) {
			generateThumb('public/uploads/' + a, '345px', 'thumb_', 'public/uploads/thumbs/');
		})

		Review.find().sort([['id', 'descending']]).limit(1).exec(function (err, reviewdata) {

			if (err) {
				res.send({ 'status': false, 'backurl': req.originalUrl });
			}
			let newReviews = new Review();
			let day = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
			newReviews.is_guest = parseInt(req.body.review_post_user);
			newReviews.review_content = req.body.review_content;
			newReviews.review_rating = req.body.rating_number;
			newReviews.review_media = uploaded_files;
			newReviews.is_reply = 0;
			newReviews.status = 0;
			newReviews.property_id = parseInt(req.body.propertyId);
			newReviews.user_id = req.session.user.id;
			newReviews.user = req.session.user._id;
			newReviews.property = req.body.propId;
			newReviews.ip_address = req.session.ip_address;
			newReviews.user_location = req.session.country;
			newReviews.created_date = day;
			newReviews.updated_date = day;
			newReviews.timestamp = Math.floor(Date.now() / 1000) / (60 * 60);
			if (reviewdata.length == 0)
				newReviews.id = 1;
			else
				newReviews.id = reviewdata[0].id + 1;


			newReviews.save(function (err) {
				if (err) {
					console.log(err);
					res.send({ 'status': false, 'backurl': req.originalUrl });
				} else {

					review_ids.push(newReviews._id);
					console.log(review_ids);

					Property.findOne({ _id: newReviews.property }, function (err, propertydata) {
						if (propertydata.reviews.includes(newReviews._id)) {
							console.log("Already have this review");
						} else {
							propertyList = propertydata.reviews;
							propertydata.reviews.push(newReviews._id);
							console.log(propertydata.reviews);
							propertydata.reviews = propertyList;
							propertydata.save(function (err) {
								if (err) {
									req.flash('error', 'save error');
									res.redirect('/errorpage');
								}
								else {
									console.log("save review to property is successful");
								}
							});
						}
					});

					User.findOne({ id: newReviews.user_id }, function (err, userdata) {

						if (userdata.reviews.includes(newReviews._id)) {
							console.log("Already have this review");
						} else {
							reviewList = userdata.reviews;
							userdata.reviews.push(newReviews._id);
							console.log(userdata.reviews);
							userdata.reviews = reviewList;
							userdata.save(function (err) {
								if (err) {
									req.flash('error', 'save error');
									res.redirect('/errorpage');
								}
								else {
									console.log("save review to user is successful");
								}
							});
						}
						let tokenData = {
							sender: req.app.locals.admin_account_id,
							receiver: userdata._id,
							amount: 1,
							operation: 'plus',
							type: 1, //type 1 = token and type 2 = point
							description: 'You earned 1 Token for Add Review'
						}
						tokenallocate.issueToken(tokenData);

						Property.findOne({ id: newReviews.property_id }, function (err, propertiesdata) {

							let activityData = {
								user: userdata._id,
								description: 'Added New Review to the location ',
								review: newReviews._id,
								property: newReviews.property,
								target_user: null,
								activity_type: 1
							}

							activities.storeRecentActivity(activityData);
						});

					});

					Badge.findOne({ id: parseInt(2) }, function (err, badgeDetails) {
						if (err) {
							req.flash('error', 'Badge Not Found');
							res.redirect('/errorpage');
						}
						else {
							Review.countDocuments({ user: req.session.user._id }, function (err, total) {
								if (total >= 10) {
									User.findOne({ _id: req.session.user._id }, function (err, user) {
										if (user.badges.includes(badgeDetails.badge_title)) {
											console.log("Already Earned This Badge");
										} else {
											badgesEarned = user.badges;
											badgesEarned.push(badgeDetails.badge_title);
											console.log(badgesEarned);
											user.badges = badgesEarned;
											user.save(function (err) {
												if (err) {
													req.flash('error', 'save error');
													res.redirect('/errorpage');
												}
												else {
													console.log("save badge");
												}
											});
										}
									});
								}
							});
						}
					});

					Badge.findOne({ id: parseInt(3) }, function (err, badgesDetails) {
						if (err) {
							req.flash('error', 'Badge Not Found');
							res.redirect('/errorpage');
						}
						else {
							Review.countDocuments({ user: req.session.user._id }, function (err, totalCount) {
								if (totalCount >= 50) {
									User.findOne({ _id: req.session.user._id }, function (err, user) {
										if (user.badges.includes(badgesDetails.badge_title)) {
											console.log("Already Earned This Badge");
										} else {
											badgesEarned = user.badges;
											badgesEarned.push(badgesDetails.badge_title);
											console.log(badgesEarned);
											user.badges = badgesEarned;
											user.save(function (err) {
												if (err) {
													req.flash('error', 'save error');
													res.redirect('/errorpage');
												}
												else {
													console.log("save badge");
												}
											});
										}
									});
								}
							});
						}
					});


					res.send({ 'status': true, 'backurl': req.originalUrl });
				}
			});
		});
	}
}
exports.updateReviewPage = function (req, res) {
	let merge_img;
	let update_merge;

	if (req.files) {
		let uploaded_files;
		uploaded = req.files.map(function (value) {
			return value.filename;
		})
		uploaded.map(function (a) {
			generateThumb('public/uploads/' + a, '345px', 'thumb_', 'public/uploads/thumbs');
		})
		uploaded = uploaded.join();

		let uploaded_arr = uploaded.split(",");
		let exist_image = req.body.images;

		if (req.body.images != undefined) {
			let delete_review_images = exist_image.join();
		}

		if (req.body.images == undefined && uploaded_arr.length == 1 && uploaded_arr[0] == '') {
			console.log("undefined or blank");
			merge_img = [];
		}
		else if (uploaded_arr.length == 1 && uploaded_arr[0] == '') {
			let merge_img = req.body.images;
		} else if (req.body.images == undefined) {
			merge_img = uploaded_arr;
		} else {
			merge_img = uploaded_arr.concat(req.body.images);
		}
		update_merge = merge_img.join();
	}
	Review.findOne({ 'id': req.body.editPageReviewId, 'property_id': req.body.prop_Id, 'user_id': req.session.user.id }, function (err, review) {
		if (err) {
			console.log("error");
		} else {
			if (review) {
				let db_reviewimages = review.review_media.split(",");

				if (req.body.images != undefined) {
					for (let i = 0; i < db_reviewimages.length; i++) {
						if ((delete_review_images.indexOf(db_reviewimages[i])) == (-1)) {

							if (fs.existsSync('public/uploads/' + db_reviewimages[i])) {
								fs.unlink('public/uploads/' + db_reviewimages[i], (err) => {
									if (err) {
										console.log('file delete error');
									} else {
										console.log('File deleted!');
									}
								});
							}

							if (fs.existsSync('public/uploads/thumbs/thumb_' + db_reviewimages[i])) {
								fs.unlink('public/uploads/thumbs/thumb_' + db_reviewimages[i], (err) => {
									if (err) {
										console.log('file delete error');
									}
									else {
										console.log('File deleted!');
									}
								});
							}
						}
					}
				} else {
					if ((review.review_media.length) != 0) {
						for (let i = 0; i < db_reviewimages.length; i++) {

							if (fs.existsSync('public/uploads/' + db_reviewimages[i])) {
								fs.unlink('public/uploads/' + db_reviewimages[i], (err) => {
									if (err) {
										console.log('file delete error');
									} else {
										console.log('File deleted!');
									}
								});
							}

							if (fs.existsSync('public/uploads/thumbs/thumb_' + db_reviewimages[i])) {
								fs.unlink('public/uploads/thumbs/thumb_' + db_reviewimages[i], (err) => {
									if (err) {
										console.log('file delete error');
									} else {
										console.log('File deleted!');
									}
								});
							}
						}
					}
				}
				let day = getDate();
				review.is_guest = req.body.review_post_user;
				review.review_content = req.body.review_content;
				review.review_media = update_merge;
				review.review_rating = req.body.rating_number;
				review.updated_date = day;

				review.save(function (err) {
					if (err) {
						console.log('review update error');
						res.send({ 'status': false, 'backurl': req.originalUrl });
					}
					else {
						console.log('review update success');
						res.send({ 'status': true, 'backurl': req.originalUrl });
					}
				});
			}
		}
	});
}

exports.deleteReviewPage = function (req, res) {
	let id = req.param('review');
	Review.findOne({ id: id, user_id: req.session.user.id }, function (err, review) {
		let del_images = review.review_media.split(",");
		Review.deleteOne({ 'id': id }, function (err) {
			let index = req.session.flagedReviews.indexOf(id);
			if (index > -1) {
				req.session.flagedReviews.splice(index, 1);
			}
			index = req.session.likedReviews.indexOf(id);
			if (index > -1) {
				req.session.likedReviews.splice(index, 1);
			}
			if ((review.review_media.length) != 0) {
				for (let i = 0; i < del_images.length; i++) {

					if (fs.existsSync('public/uploads/' + del_images[i])) {
						fs.unlink('public/uploads/' + del_images[i], (err) => {
							if (err) {
								console.log('file delete error');
							} else {
								console.log('File deleted!');
							}
						});
					}

					if (fs.existsSync('public/uploads/thumbs/thumb_' + del_images[i])) {
						fs.unlink('public/uploads/thumbs/thumb_' + del_images[i], (err) => {
							if (err) {
								console.log('file delete error');
							} else {
								console.log('File deleted!');
							}
						});
					}
				}
			}

			FlaggedReview.deleteMany({ 'review_id': id }, function (err) {
				if (err) {
					req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
					console.log('err');
				}
				console.log('flagged Review deleted');
			});

			Like.deleteMany({ 'review_id': id }, function (err) {
				if (err) {
					req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
					console.log('err');
				}
				console.log('Review Like deleted');
			});
			req.flash('success', 'Review deleted successfully');
			res.redirect(req.header('Referer'));
		});
	});
}

exports.deletereplyReviewPage = function (req, res) {
	Review.updateOne({ 'id': req.body.review_id }, { $set: { 'is_reply': 0, 'reply_text': '' } }, function (err, done) {
		if (err) {
			res.send({ 'status': false });
		}
		else {
			res.send({ 'status': true });
		}
	});
}

exports.getEditReviewDetailPage = function (req, res) {
	let review_id = req.param('review_id');
	Review.findOne({ id: review_id, user_id: req.session.user.id }, function (err, review) {
		if (err) {
			console.log('err');
			res.send({ 'status': false });
		}
		res.send({ 'status': true, 'data': review });
	});
}

exports.forgotPasswordConfirm = function (req, res) {
	let hash = req.param('active_link');
	User.findOne({ 'forgot_hash': hash }, function (err, user) {
		if (err) {
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else {
			if (user) {
				let currentTime = new Date().getTime();
				if (user.forgot_hash_date > currentTime) {
					console.log('forgotdate is big');
					res.render('resetpassword', {
						error: req.flash("error"),
						success: req.flash("success"),
						session: req.session,
						user: user.id
					});
				}
				else {
					console.log('day is big');
					req.flash('error', 'Sorry, Session expired, please regenerate activation key');
					res.redirect('/forgotpassword');
				}
			}
			else {
				console.log("hash not avail");
				req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

exports.createNewPasswordPage = function (req, res) {
	User.findOne({ 'id': req.body.user_id }, function (err, user) {
		if (err) {
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else {
			if (user) {
				user.password = user.generateHash(req.body.password);
				user.forgot_hash = '';
				user.forgot_hash_date = '';
				user.save();
				req.flash('success', 'Password reset successfully');
				res.redirect('/login');
			}
			else {
				req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

exports.updatePasswordPage = function (req, res) {
	User.findOne({ 'id': req.session.user.id }, function (err, user) {
		if (err) {
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else {
			if (user) {
				if (!user.validPassword(req.body.old_password)) {
					req.flash('error', 'Sorry, old password does not match with database');
					res.redirect('/changepassword');
				}
				else {
					user.password = user.generateHash(req.body.new_password);
					user.save();
					req.flash('success', 'Password changed successfully');
					res.redirect('/changepassword');
				}
			}
			else {
				console.log("email not exist");
				req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

function IsNumeric(input) {
	let RE = /^-{0,1}\d*\.{0,1}\d+$/;
	return (RE.test(input));
}

exports.showPropertyDetailPage = async function (req, res) {
	let counter = 0;
	let claimId = '';
	let perPage = 5;
	let userId = 0;
	let filter = {};
	let claimStatus = 0;
	let page = 0;
	let keyword = '';
	let isFlaggedLocation = 0;
	let otherClaimStatus = 0;
	let isFollowed = 0;
	let propertyImagesList = [];

	if (req.session.user) {
		userId = req.session.user.id;
	}

	if (req.query.keyword) {
		keyword = req.query.keyword;
	}

	let slug = req.params.slug;
	let property = await Property.findOne({ slug: slug }).populate({ model: 'User', path: 'user', select: 'id first_name last_name mail contact_number user_type status' }).populate({ model: 'Category', path: 'category', select: 'id category_name' }).exec();

	let likedReviews = await Like.find({ property: property._id }).exec();

	console.log("default Property object");
	//console.log(property);
	if (req.session.user) {
		let followedLocations = [];
		let followedLocation = await Follower.find({ property: property._id, follower_user: req.session.user._id }).exec();
		followedLocation.forEach(function (locations) {
			if (locations) {
				followedLocations.push(locations.property);
			}
			console.log(locations.property);
			console.log(followedLocations);
			if (locations) {
				if (followedLocations.includes(locations.property)) {
					isFollowed = 1;
				}
			}
		});
	}
	if(req.session.user){
	if(req.session.user.user_type != 3){
	if (property.length <= 0) {
		req.flash('error', 'Could not find location');
		backURL = req.header('Referer') || '/search';
		res.redirect(backURL);
	}

	// if (property.status == 2) {
	// 	if (req.session.user) {
	// 		if (req.session.user._id != property.user) {
	// 			req.flash('error', 'Location is Deactivated');
	// 			backURL = req.header('Referer') || '/search';
	// 			res.redirect(backURL);
	// 		}
	// 	} else {
	// 		req.flash('error', 'Could not find location');
	// 		backURL = req.header('Referer') || '/search';
	// 		res.redirect(backURL);
	// 	}
	// } else if (property.status != 1) {
	// 	if (req.session.user) {
	// 		if (req.session.user._id != property.user) {
	// 			req.flash('error', 'Location is in Pending State');
	// 			backURL = req.header('Referer') || '/search';
	// 			res.redirect(backURL);
	// 		}
	// 	} else {
	// 		req.flash('error', 'Could not find location');
	// 		backURL = req.header('Referer') || '/search';
	// 		res.redirect(backURL);
	// 	}
	// }
	}
	}

	let claims = await Claims.find({ status: 0, property_id: property.id });
	if (claims.length > 0) {
		claims.forEach(function (cliam) {
			if (cliam.user_id == userId && cliam.property_id == propertyDetails.id) {
				claimStatus = 1;
				claimId = cliam.id;
			}
		});
	}
	let categoriesObj = await Category.find({});
	let categories = [];
	categoriesObj.forEach(function (cate) {
		categories[cate.id] = (cate);
	});
	userIds = [];

	counter = await Review.countDocuments({ property_id: property.id });
	let reviewList = await Review.find({ property_id: property.id, is_type: 0 }).populate({ path: 'user', select: 'id first_name last_name status user_type mail' }).limit(perPage).skip(perPage * page).exec();
	property.reviews = [];

	reviewList.forEach(function (review) {
		userIds.push(review.user);
	});

	property.category_name = getCategoryName(property.category_id, categories);
	property.user_type = property.user.user_type;
	property.user_status = property.user.status;
	property.contact_number = property.user.contact_number;
	property.first_name = property.user.first_name;
	property.last_name = property.user.last_name;
	property.mail = property.user.mail;
	property.total_reviews = counter;

	let avg_review_rating = 0;
	let review_types = { one: 0, two: 0, three: 0, four: 0, five: 0 };
	let i = 0;
	reviewList.forEach(function (review) {
		avg_review_rating += review.review_rating;
		if (review.review_rating == 1) review_types.one++;
		else if (review.review_rating == 2) review_types.two++;
		else if (review.review_rating == 3) review_types.three++;
		else if (review.review_rating == 4) review_types.four++;
		else if (review.review_rating == 5) review_types.five++;
	});
	reviewList.forEach(function (review) {
		property.reviews[i] = review;
		i++;
	});
	console.log("reviewList");
	console.log(reviewList);
	property.avg_review_rating = avg_review_rating / reviewList.length;
	property.review_types = review_types;
	if (req.session.user) {
		let spamlocation = await ReportFlag.find({ report_type: parseInt(2), user: req.session.user._id, property: parseInt(property.id) }).exec();
		if (spamlocation.length > 0) {
			isFlaggedLocation = 1;
		}
	}
	let isLoggedIn = 0;
	if (req.session.user) {
		isLoggedIn = 1;
	}
	let is_usertype = 0;
	if (req.session.user) {
		if (req.session.user.user_type == 2) {
			is_usertype = 2;
		} else if (req.session.user.user_type == 1) {
			is_usertype = 1;
		} else {
			is_usertype = 3;
		}
	} else {
		is_usertype = 0;
	}

	console.log(property.property_images);
	propertyImagesList = property.property_images.toString().split(",");
	console.log(propertyImagesList);
	let thumbList = property.property_images.toString().split(",");
	let thumbImageList = [];
	for(var j=0;j<thumbList.length;j++){
		thumbImageList.push("thumb_" + thumbList[j]);
	}
	console.log(thumbImageList);
	
	res.render('listing/propertyDetail.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		page: page,
		keyword: keyword,
		filters: filter,
		property: property,
		propertyImagesList: propertyImagesList,
		thumbImageList: thumbImageList,
		likedReviews: likedReviews,
		categories: categories,
		counter: counter,
		claimStatus: claimStatus,
		otherClaimStatus: otherClaimStatus,
		claimId: claimId,
		perPage: perPage,
		isFlaggedLocation: isFlaggedLocation,
		isFollowed: isFollowed,
		is_usertype: is_usertype,
		isLoggedIn: isLoggedIn,
	});
}

exports.showSearchPage = async function (req, res) {
	console.log('showSearchPage');
	let keyword = '';
	let categoriesToSearch = [];
	let filter = {};
	let searchedProperties = [];
	let page = 0;
	let perPage = 5;
	let categoriesList = [];
	let selected_area = '';
	let categories = [];
	let area = '';
	let locationsToSearch = [];

	let submited_data = {};
	submited_data.ratings = [];
	submited_data.category = [];
	submited_data.location = [];

	if (req.query.keyword) {
		keyword = req.query.keyword.trim().toLowerCase();
	} else {
		keyword = '';
	}

	if (req.query.area) {
		selected_area = req.query.area;
	}

	if (req.body.ratings) {
		submited_data.ratings = req.body.ratings;
	}

	if (req.body.category) {
		submited_data.category = [];
		req.body.category.forEach(function (cats) {
			submited_data.category.push(parseInt(cats));
		});
	}

	if (req.query.location) {
		area = req.query.location;
		submited_data.location.push(req.query.location);
		locationsToSearch.push(req.query.location);
	}
	console.log(area.length);
	if(area.length==0 && req.query.keyword){
		areaToSearch = req.query.keyword.trim();
		area = areaToSearch.split(" - ");
		if(area.length>1){
			area.splice(-1, 1);
		}
		area = area.join(' ');
		area = area.toLowerCase();
	}

	if (req.body.location) {
		submited_data.location = req.query.location;
	}

	if (req.query.page) {
		if (IsNumeric(req.query.page)) {
			page = req.query.page;
		} else {
			req.flash('error', 'Invalid param page in property search');
			res.redirect('/errorpage');
		}
	}

	categories = await Category.find({ category_name: { "$regex": area, "$options": "i" } });
	console.log("Category length:" + categories.length);
	categories.forEach(function (category) {
		categoriesList[category.id] = category;
		if (submited_data.category.length == 0) {
			categoriesToSearch.push(parseInt(category.id));
		} else {
			categoriesToSearch = submited_data.category;
		}
	});
	filter.keyword = keyword;

	//Get Claim Data
	let claimDataProperies = [];
	let claimData = await Claims.find();
	claimData.forEach(function (claim) {
		claimDataProperies.push(claim.property);
	})

	let locations = await Property.find({ status: parseInt(1) }).distinct('area');
	console.log("Area:"+area);
	console.log(categoriesToSearch);
	//Get Properties with User, Category and Reviews	
	if (req.query.location) {
		propertiesCount = await Property.countDocuments({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }] }, { area: { $in: locationsToSearch } }, { status: 1 }] });
		properties = await Property.find({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }] }, { area: { $in: locationsToSearch } }, { status: 1 }] }).limit(perPage).skip(perPage * page).sort({ property_name: 'asc' }).exec();
		console.log("location search only");		
	} else if(req.query.keyword) {
		console.log("keyword search only for "+area);
		propertiesCount = await Property.countDocuments({ $and: [{ $or: [{ property_name: { "$regex": area, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { "$regex": area, "$options": "i" } }] }, { status: 1 }] });
		
		properties = await Property.find({ $and: [{ $or: [{ property_name: { "$regex": area, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { "$regex": area, "$options": "i" } }] }, { status: 1 }] }).limit(perPage).skip(perPage * page).sort({ property_name: 'asc' }).exec();		
	}else{
		propertiesCount = await Property.countDocuments({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { address1: { "$regex": keyword, "$options": "i" } }, { address2: { "$regex": keyword, "$options": "i" } }, { post_code: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { $in: locationsToSearch } }] }, { status: 1 }] });
		properties = await Property.find({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { address1: { "$regex": keyword, "$options": "i" } }, { address2: { "$regex": keyword, "$options": "i" } }, { post_code: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { $in: locationsToSearch } }] }, { status: 1 }] }).limit(perPage).skip(perPage * page).sort({ property_name: 'asc' }).exec();
	}
	console.log(properties.length);
	let counter = propertiesCount;
	/*
	properties = await Property.find({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { address1: { "$regex": keyword, "$options": "i" } }, { address2: { "$regex": keyword, "$options": "i" } }, { post_code: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { $in: locationsToSearch } }] }, { status: 1 }] }).limit(perPage).skip(perPage * page).sort({ property_name: 'asc'}).exec();
	*/
	sproperties = await Property.find({ status: 1, is_featured: 1 }).sort({ 'id': 1 }).limit(5);
	let fields = ['id', 'property_name', 'area', 'country', 'address1', 'address2', 'post_code', 'category', 'user_id', 'average_rating','slug'];
	let searchId = getRandomInt(10);
	console.log("search column" + fields[searchId]);
	switch (searchId) {
		case 1:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'id': 1 }).limit(5);
			break;
		case 2:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'property_name': 1 }).limit(5);
			break;
		case 3:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'area': 1 }).limit(5);
			break;
		case 4:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'country': 1 }).limit(5);
			break;
		case 5:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'address1': 1 }).limit(5);
			break;
		case 6:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'address2': 1 }).limit(5);
			break;
		case 7:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'post_code': 1 }).limit(5);
			break;
		case 8:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'category': 1 }).limit(5);
			break;
		case 9:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'user_id': 1 }).limit(5);
			break;
		case 10:
			sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').sort({ 'average_rating': 1 }).limit(5);
			break;
	}
	properties.forEach(function (property) {
		property.is_claimed = checkIsClaimedProperty(property.id, claimDataProperies);
		searchedProperties.push(property);
	});
	submited_data.location.push(selected_area);

	//Get Categories Data
	categories = await Category.find();
	categories.forEach(function (category) {
		categoriesList[category.id] = category;
		if (submited_data.category.length == 0) {
			categoriesToSearch.push(parseInt(category.id));
		} else {
			categoriesToSearch = submited_data.category;
		}
	});
	let featuredListing = [];	
	sproperties.forEach(function (featured) {
		categoryName = '';
		propertyObj = {};
		featured.category.forEach(function (cate_name) {
			categoryName += ' ' + cate_name.category_name;
		});
		console.log("catname=" + categoryName);
		propertyObj.id = featured.id;
		propertyObj.property_name = featured.property_name;
		propertyObj.address1 = featured.address1;
		propertyObj.address2 = featured.address2;
		propertyObj.post_code = featured.post_code;
		propertyObj.area = featured.area;
		propertyObj.slug = featured.slug;
		propertyObj.country = featured.country;
		propertyObj.average_rating = featured.average_rating;
		propertyObj.category_name = categoryName;
		media_url = featured.property_images.split(",");
		propertyObj.media_url = media_url[0];
		if (typeof featured.reviews.length !== 'undefined' && featured.reviews.length) {
			propertyObj.review_count = featured.reviews.length;
		} else {
			propertyObj.review_count = 0;
		}
		featuredListing.push(propertyObj);
	});

	let total_pages = counter / perPage;
	res.render('search2', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		properties: searchedProperties,
		categories: categoriesList,
		keyword: keyword,
		filters: filter,
		page: page,
		counter: counter,
		locations: locations,
		submited_data: submited_data,
		sproperties: featuredListing,
		total_pages: total_pages,
		perpage: perPage,
		ordered_column: '',
		ordered_sort: '',
	});
}

/*exports.showSearchPage = async function(req, res){
	console.log("showSearchPage")
	res.render('search2', {
			error : req.flash("error"),
			success: req.flash("success"),
			session: req.session
		});
}
*/
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getDate() {
	return new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
}

function getDate1(date) {
	let d = new Date(date);
	return d.toLocaleString("en-US", { timeZone: "Europe/London" });
}

function getNextmonthFirstDay() {
	let date = new Date(), y = date.getFullYear(), m = date.getMonth();
	let lastDay = new Date(y, m + 1, 1);
	return lastDay.getFullYear() + '/' + addZero(lastDay.getMonth() + 1) + '/' + addZero(lastDay.getDate());
}

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

function getPropertyAverageRating(property_id, reviews) {
	let counter = 0;
	let totcounter = 0;
	reviews.forEach(function (review) {
		if (review.property_id == property_id) { counter += review.review_rating; totcounter++; }
	});
	return isNaN(parseInt(counter / totcounter)) ? 0 : parseInt(counter / totcounter);
}

function getPropertyReviewCount(property_id, reviews) {
	let counter = 0;
	reviews.forEach(function (review) {
		if (review.property_id == property_id) counter++;
	});
	return counter;
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

function isProfileComplete(profile) {
	let isComplete = 0;
	if (profile.first_name != '' && profile.last_name != '' && profile.dob != '' && profile.gender != ''
		&& profile.profile_photo != '' && profile.ethnicity != '' && profile.contact_number != '' &&
		profile.address1 != '' && profile.address2 != '' && profile.area != '' && profile.city != '' &&
		profile.country != '' && profile.postcode != '' && profile.tag_line != '') {
		isComplete = 1;
	}
	return isComplete;
}
function checkIsClaimedProperty(id, list) {
	let flag = 0;
	list.forEach(function (nid) {
		if (id == nid) {
			flag++;
		}
	});
	if (flag == 0) return false;
	else return true;
}

function generateThumb(fileName, width, prefix, destinationFolder) {
	thumb({
		prefix: prefix,
		suffix: '',
		source: fileName,
		destination: destinationFolder,
		concurrency: 1,
		overwrite: true,
		width: width,
	}, function (err, stdout, stderr) {
		if (err) { return false; } else { return true; }
	});
}