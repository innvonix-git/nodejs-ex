let models = require('../../app/models/revstance_models');
let BusinessPlans = require('../../app/models/business_plans');
let constants = require('../../config/constants');
let mongoose = require('mongoose');
var moment = require('moment');
const ObjectId = mongoose.Types.ObjectId;
let User = models.User;
let Property = models.Property;
let Businessplan = models.Businessplan;
let Setting = models.Setting;
let PaymentHistory = models.PaymentHistory;
let dynamicmail = require('../../app/controllers/dynamicMailController');

exports.storePaymentCard = async function (req, res) {
	let stripe = require('stripe')(req.app.locals.stripe_secret);
	let user = req.session.user._id;
	let card_number = req.body.card_number;
	let cvv = req.body.cvv;
	let expiration_month = req.body.expiration_month;
	let expiration_year = req.body.expiration_year;
	let accept_terms = req.body.accept_terms;
	let current_user = await User.findOne({ _id: user });
	let backURL = req.header('Referer') || '/';
	console.log(accept_terms);
	if (parseInt(accept_terms) != 1) {
		req.flash('error', 'Please accept terms and condition.');
		res.redirect(backURL);
	} else {
		try {
			let userdata = '';
			if (current_user.stripe_customer.length == 0) {
				let customerObject = await stripe.customers.create({ email: req.session.user.mail });
				userdata = await User.findOneAndUpdate({ _id: req.session.user._id }, { stripe_customer: customerObject.id }, { new: true });
				current_user = await User.findOne({ _id: user });
			}
			if (current_user.stripe_card_id.length != 0) {
				console.log("deleteCard error");
				let deleteCard = await stripe.customers.deleteCard(current_user.stripe_customer, current_user.stripe_card_id);
				console.log(deleteCard);
			}
			let token = await stripe.tokens.create({ card: { "number": card_number, "exp_month": expiration_month, "exp_year": expiration_year, "cvc": cvv } });
			console.log(token);
			let card = await stripe.customers.createSource(current_user.stripe_customer, { source: token.id });
			console.log(card);
			userdata = await User.findOneAndUpdate({ _id: req.session.user._id }, { stripe_card_id: card.id }, { new: true });
			req.flash('success', 'Your card information is saved, you can purchase featured membership now.');
			res.redirect('/business-memberships');
		} catch (err) {
			req.flash('error', 'Your card information is not proper, please provide proper card details.');
			res.redirect(backURL);
		}
	}
}

exports.paymentForm = async function (req, res) {
	res.render('payment_form.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		session: req.session,
	});
}

exports.purchaseFeaturedMembership = async function (req, res) {
	let stripe = require('stripe')(req.app.locals.stripe_secret);
	let loggedInUser = await User.findOne({ '_id': req.session.user._id });
	let autorenew = 0;
	let plan_tenure = 'monthly';
	let plan_expiry_date = '';
	let cost = 0;
	console.log(req.body);
	const ObjectId = require('mongoose').Types.ObjectId;
	let backURL = req.header('Referer') || '/';

	if (!req.body.location) {
		req.flash('error', 'Please Select Location');
		res.redirect(backURL);
	}
	try {
		let payment_method = req.body.payment_method;
		console.log("2. payment_method" + payment_method);
		let settings = await Setting.findOne({ id: parseInt(1) });
		if (req.body.plan_autorenew) {
			autorenew = 1;
		}
		if (req.body.plan_tenure) {
			plan_tenure = 'yearly';
			plan_expiry_date = getExpiryDate(12);
		} else {
			plan_expiry_date = getExpiryDate(1);
		}

		console.log(plan_expiry_date);
		if (payment_method == 'token') {
			if (plan_tenure == 'monthly') {
				cost = parseInt(settings.monthly_featuredmemberhip_token);
			} else {
				cost = parseInt(settings.yearly_featuredmemberhip_token);
			}
		} else {
			if (plan_tenure == 'monthly') {
				cost = parseInt(settings.monthly_featuredmemberhip_flat);
			} else {
				cost = parseInt(settings.yearly_featuredmemberhip_flat);
			}
		}
		let location = req.body.location;
		console.log("Location: " + location);
		let locationData = await Property.findOne({ _id: ObjectId(location.trim()) });
		console.log("locationData=");
		console.log(locationData);
		if (locationData.is_featured == 1 || parseInt(locationData.is_featured) == 1) {
			updatedData = {};
			updatedData.is_featured_plan_autorenew = autorenew;
			locationData = await Property.findOne({ _id: ObjectId(location) }, updatedData, { new: true });
			req.flash('success', 'Featured membership plan updated successfully.');
			res.redirect('/business-memberships');
		}

		if (payment_method == 'token') {
			if (parseInt(loggedInUser.token_balance) > cost) {
				if (createFeaturedListing(location, loggedInUser, 1, autorenew, plan_expiry_date, cost, req, cost)) {
					req.flash('success', 'Featured membership plan purchased successfully.');
				} else {
					req.flash('error', 'Error while udating featured membership plan, please contact Admin.');
				}
			} else {
				req.flash('error', 'Sorry, You do not have enough tokens to buy premium plan.');
			}
			res.redirect('/business-memberships');
		} else {
			if (loggedInUser.stripe_customer.length > 0) {
				console.log("Stripe customer found");
				if (loggedInUser.stripe_card_id.length > 0) {
					//let businessPlan = await Businessplan.findOne({'id':parseInt(1)});
					let chargeAmount = parseInt(cost) * parseInt(107);
					let charged = await stripe.charges.create({ amount: chargeAmount, currency: "gbp", source: loggedInUser.stripe_card_id, customer: loggedInUser.stripe_customer, description: "Charge for Featured membership " });
					if (charged) {
						let paymentObj = PaymentHistory();
						paymentObj.id = parseInt(1);
						paymentObj.user = loggedInUser._id;
						paymentObj.amount = parseInt(chargeAmount);
						paymentObj.currency = "gbp";
						paymentObj.tx_id = charged.id;
						paymentObj.description = "Featured listing purchase ";
						paymentObj.payment_type = "Flat currency";
						paymentObj.status = parseInt(1);
						paymentObj.created_date = getDate();
						paymentObj.updated_date = getDate();
						let insertedPayment = paymentObj.save();
						if (createFeaturedListing(location, loggedInUser, 0, autorenew, plan_expiry_date, 0, req, chargeAmount)) {
							req.flash('success', 'Featured membership plan purchased successfully.');
						} else {
							req.flash('error', 'Error : Error udating membership, please contact Admin.');
						}
						res.redirect('/business-memberships');
					}
				}
				else {
					req.flash('error', 'Please provide card details first and then continue.');
					res.redirect('/payment_details');
				}
			} else {
				console.log("Customer creation");
				let stripeUser = await stripe.customers.create({ email: req.session.user.mail });
				loggedInUser = await User.findOneAndUpdate({ _id: req.session.user._id }, { stripe_customer: stripeUser.id }, { new: true });
				console.log(stripeUser);
				req.flash('error', 'Please provide card details first and then continue.');
				res.redirect('/payment_details');
			}
		}
	} catch (err) {
		req.flash('error', 'Error : Unhandelled error occurred.' + err.message);
		console.log(err);
		res.redirect('/business-memberships');
	}
}

async function createFeaturedListing(location, loggedInUser, updateToken, autorenew = 0, plan_expiry_date = '', tokenToDeduct = 0, req = '', chargeAmount = 0) {
	try {
		var ObjectId = require('mongoose').Types.ObjectId;
		let plan = await Businessplan.findOne().sort({ id: parseInt(-1) });
		let updatedData = {};
		updatedData.is_featured = parseInt(1);
		updatedData.feature_start_date = getDate();
		updatedData.featured_end_date = plan_expiry_date;
		updatedData.featured_plan_id = plan.id;
		updatedData.is_featured_plan_autorenew = parseInt(autorenew);
		let featuredLocation = await Property.findOneAndUpdate({ _id: ObjectId(location) }, updatedData, { new: true });
		let amount = '';
		if (updateToken == 1) {
			loggedInUser = await User.findOneAndUpdate({ id: loggedInUser.id }, { token_balance: (parseInt(loggedInUser.token_balance) - parseInt(tokenToDeduct)) }, { new: true });
			amount = tokenToDeduct + ' STT';
		} else {
			amount = parseInt(chargeAmount) / parseInt(100);
			amount = amount + ' Pound';
		}

		var sendmail = {
			receiver_name: loggedInUser.first_name + " " + loggedInUser.last_name,
			receiver_email: loggedInUser.mail,
			paid_amount: amount,
			location_title: featuredLocation.property_name,
			purchase_date_time: getDate(),
			email_type: 12
		}
		dynamicmail.sendMail(sendmail);
		return 1;
	}
	catch (err) {
		console.log(err);
		return 0;
	}
}

function getExpiryDate(param) {
	var date = new Date(), y = date.getFullYear(), m = date.getMonth();
	if (parseInt(param) == 1) {
		return date.getFullYear() + '/' + addZero(date.getMonth() + 2) + '/' + addZero(date.getDate() + 1);
	} else {
		return (parseInt(date.getFullYear()) + parseInt(1)) + '/' + addZero(date.getMonth() + 1) + '/' + addZero(date.getDate() + 1);
	}
}


function getShortDate() { let d = new Date(); return d.getFullYear() + '/' + addZero(d.getMonth() + 1) + '/' + addZero(d.getDate()); }

function getNextmonthFirstDay() {
	let date = new Date(), y = date.getFullYear(), m = date.getMonth();
	let lastDay = new Date(y, m + 1, 1);
	return lastDay.getFullYear() + '/' + addZero(lastDay.getMonth() + 1) + '/' + addZero(lastDay.getDate());
}

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

function getDateDifferent(from, to) {
	let from = new Date(from);
	let to = new Date(to);
	let timeDiff = Math.abs(to.getTime() - from.getTime());
	let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays;
}

function addDays(date, days) {
	let result = new Date(date);
	result.setDate(result.getDate() + days);
	return result.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
}

function getDate() {
	return new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
}

exports.buyTokensProcess = async function (req, res) {
	let stripe = require('stripe')(req.app.locals.stripe_secret);
	let token_amount = parseInt(req.body.token_amount);
	let cost = parseFloat(token_amount) * parseFloat(req.app.locals.token_price_rate);
	//cost = cost * 100;
	let loggedInUser = await User.findOne({ id: req.session.user.id });
	cost = cost + Math.ceil((cost * 7)) / Math.ceil(100);
	let extracost = 0;
	if (loggedInUser.stripe_card_id.length > 0) {
		if (token_amount<=100){
			extracost = parseFloat(cost) + parseFloat(0.20); 
			extracost = parseFloat(extracost)/(parseFloat(1)-parseFloat(0.014));
			costToCut = cost + (parseFloat(extracost)*100);
		}else{
			costToCut = cost;
		}
		console.log("costToCut" + costToCut);
		let charged = await stripe.charges.create({amount: Math.round(costToCut), currency: "gbp", source: loggedInUser.stripe_card_id, // obtained with Stripe.js card_1D01FvCcIhEEYxb98SSklVrt
			customer: loggedInUser.stripe_customer, description: "Charge for Token purchase"
		});

		if (charged) {
			let newtoken_count = parseInt(loggedInUser.token_balance) + parseInt(token_amount);
			let userdata = await User.findOneAndUpdate({ _id: req.session.user._id }, { token_balance: newtoken_count }, { new: true });
		}
		let paymentObj = PaymentHistory({
			'id': parseInt(1),
			'user': loggedInUser._id,
			'amount': cost,
			'currency': "gbp",
			'tx_id': charged.id,
			'description': "Token purchase using flat currency",
			'payment_type': "Flat currency",
			'status': parseInt(1),
			'created_date': getDate(),
			'updated_date': getDate(),
		});
		let insertedPayment = paymentObj.save();
		var sendmail = {
			receiver_name: loggedInUser.first_name + " " + loggedInUser.last_name,
			receiver_email: loggedInUser.mail,
			paid_amount: cost,
			token_amount: parseInt(token_amount),
			purchase_date_time: getDate(),
			email_type: 11
		}
		dynamicmail.sendMail(sendmail);
		req.flash('success', 'Token purchased successfully.');
		let backURL = req.header('Referer') || '/';
		res.redirect(backURL);
	} else {
		req.flash('error', 'Please provide card details first and then continue.');
		res.redirect('/payment_details');
	}
}

exports.buyTokens = async function (req, res) {
	if (!req.session.user) {
		res.redirect('/login');
	} else if (req.session.user && req.session.user_type == 1) {
		res.redirect('/home');
	} else {
		console.log(constants.token_price);
		res.render('buy_token', {
			error: req.flash("error"),
			success: req.flash("success"),
			user: req.session.user,
			session: req.session,
			token_price: constants.token_price,
		});
	}
}

exports.getMembershipData = async function (req, res) {
	if (!req.session.user) {
		res.redirect('/login');
	} else if (req.session.user && req.session.user_type == 1) {
		res.redirect('/home');
	} else {
		let plans = await BusinessPlans.find();
		let loggedInUser = await User.findOne({ id: req.session.user.id });
		let locations = await Property.find({ user: req.session.user._id, status: 1 }).select('id property_name is_featured is_featured_plan_autorenew feature_start_date featured_end_date');
		let settings = await Setting.findOne({ id: parseInt(1) });
		console.log(settings);

		res.render('business_membership', {
			plans: plans,
			error: req.flash("error"),
			success: req.flash("success"),
			user: loggedInUser,
			session: req.session,
			locations: locations,
			settings: settings,
		});
	}
}

exports.purchaseMembershipPlan = async function (req, res) {
	if (!req.session.user) {
		res.redirect('/login');
	} else if (req.session.user && req.session.user_type == 1) {
		res.redirect('/home');
	} else {
		let plan_id = req.params.plan_id;
		if (!plan_id) {
			req.flash('error', 'Something is wrong business plan purchase');
			res.redirect('/errorpage');
		}
		let plan = await BusinessPlans.findOne({ '_id': plan_id });

		res.render('purchase_membership', {
			plan: plan,
			error: req.flash("error"),
			success: req.flash("success"),
			user: req.session.user,
			session: req.session,
		});
	}
}

exports.getBusinessDetail = function (req, res) {
	User.find({ id: parseInt(req.query.id) }, function (err, business) {
		if (err) {
			req.flash('error', 'Something is wrong Admin Panel Business');
			res.redirect('/errorpage');
		}
		else {
			let userIds = [];
			let businessList = [];
			if (business) {
				business.forEach(function (bs) {
					businessList.push(bs);
					userIds.push(parseInt(bs.user_id));
				});
				console.log(userIds);
				getUsers(businessList, userIds, req, res, 'admin/businessDetails.ejs');
			} else {
				console.log('Business not found');
			}
		}
	});
}

exports.getAllBusiness = function (req, res) {
	User.find({}, function (err, business) {
		if (err) {
			req.flash('error', 'Error : something is wrong Business');
			res.redirect('/errorpage');
		}
		else {
			let userIds = [];
			let businessList = [];
			console.log("Count :" + business.length);
			business.forEach(function (bs) {
				businessList.push(bs);
				userIds.push(parseInt(bs.user_id));
			});
			console.log(businessList);
			getUsers(businessList, userIds, req, res, 'admin/allBusiness.ejs');
		}
	});
}

exports.paymenthistoryPage = async function (req, res) {
	let page = 0;
	let skip = 0;
	let perpage = 10;
	let usersList = [];
	let total_count = 0;
	let keyword = '';
	let ordered_column = 'id';
	let ordered_sort = -1;

	if (req.query.perpage) {
		perpage = parseInt(req.query.perpage);
	}
	if (req.query.page) {
		page = parseInt(req.query.page);
		if (page < 0) page = 0;
		skip = page * perpage;
	}
	if (req.query.keyword) {
		keyword = req.query.keyword.trim().toLowerCase();
	}
	var sortClause = {};
	if (req.query.ordered_column) {
		ordered_column = req.query.ordered_column;
	}
	if (req.query.ordered_sort) {
		ordered_sort = parseInt(req.query.ordered_sort);
	}
	let paymenthistory = [];
	if (ordered_column == 'tx_id') {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { tx_id: { "$regex": keyword, "$options": "i" } }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'tx_id': ordered_sort }).skip(skip).limit(perpage).exec();
	} else if (ordered_column == 'amount') {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'amount': ordered_sort }).skip(skip).limit(perpage).exec();
	} else if (ordered_column == 'description') {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'description': ordered_sort }).skip(skip).limit(perpage).exec();
	} else if (ordered_column == 'created_date') {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'created_date': ordered_sort }).skip(skip).limit(perpage).exec();
	} else if (ordered_column == 'user.first_name') {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'user.first_name': ordered_sort }).skip(skip).limit(perpage).exec();
	} else {
		paymenthistory = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }]).collation({ locale: "en" }).sort({ 'id': ordered_sort }).skip(skip).limit(perpage).exec();
	}

	total_count = await PaymentHistory.aggregate([{ $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $match: { $or: [{ amount: parseInt(keyword) }, { description: { "$regex": keyword, "$options": "i" } }, { created_date: { "$regex": keyword, "$options": "i" } }, { tx_id: { "$regex": keyword, "$options": "i" } }, { 'user.first_name': { "$regex": keyword, "$options": "i" } }, { 'user.last_name': { "$regex": keyword, "$options": "i" } }] } }, { $count: "total_count" }]).collation({ locale: "en" }).exec();

	if (total_count.length > 0) {
		total_count = total_count[0].total_count;
	}

	page_count = Math.ceil(total_count / perpage);

	res.render('admin/paymenthistory.ejs', {
		error: req.flash("error"),
		success: req.flash("success"),
		payments: paymenthistory,
		page: page,
		perpage: perpage,
		total_count: total_count,
		total_pages: page_count,
		keyword: keyword,
		ordered_sort: ordered_sort,
		ordered_column: ordered_column,
		counter: total_count,
		moment: moment
	});
}

function getUsers(businessList, usersIds, req, res, routeName) {
	let usersList = [];
	User.find({ 'id': { $in: usersIds } }, function (err, users) {
		if (err) {
			req.flash('error', 'Error : something is wrong Business');
			res.redirect('/errorpage');
		}
		else {
			users.forEach(function (user) {
				usersList[user.id] = [];
				usersList[user.id]["first_name"] = user.first_name;
				usersList[user.id]["last_name"] = user.last_name;
				usersList[user.id]["mail"] = user.mail;
			});
			console.log(businessList);
			console.log(usersList);
			res.render(routeName, {
				error: req.flash("error"),
				success: req.flash("success"),
				business: businessList,
				users: usersList
			});
		}
	});
}
