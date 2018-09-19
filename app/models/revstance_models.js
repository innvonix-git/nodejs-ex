var mongoose = require ('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var autoIncrement = require('mongodb-autoincrement');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({	
	id:{ type: Number, default: 1 },
	first_name: String,
	last_name: String,
	mail: String,
	password: String,
	dob: { type: String, default: '' },
	gender: { type: String, default: '' },
	profile_photo: { type: String, default: '' },
	ethnicity: { type: String, default: '' },
	contact_number: { type: String, default: '' },
	user_type: Number,
	address1: { type: String, default: '' },
	address2: { type: String, default: '' }, 
	area: { type: String, default: '' },
	city: { type: String, default: '' },
	country: { type: String, default: '' },
	postcode: { type: String, default: '' },
	business_name: { type: String, default: '' }, 
	ip_address: String,
	status: Number,
	tag_line: { type: String, default: '' },
	is_influencer: Number,	
	wallet_id: String,
	token_balance: { type: Number, default: 0 },
	point_balance: { type: Number, default: 0 },
	badges: [String],
	membership: { type: Schema.Types.ObjectId, ref: 'Membership' },
	next_membership_plan: { type: Schema.Types.ObjectId, ref: 'Membership' }, 
	next_billing_cycle: { type: String, default: "" }, 
	transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }], 
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }], 	
	reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	auto_renew: { type: Number, default: 1 },
	referral_id: { type: Number, default: 0 },
	referral_link: { type: String, default: '' },
	business_name: { type: String, default: '' },
	business_address1: { type: String, default: '' },
	business_address2: { type: String, default: '' },
	business_area: {type: String, default: ''}, 
	business_contact_number: { type: String, default: '' },
	business_status: { type: Number, default: 0 },
	stripe_customer: { type: String, default: "" },
	stripe_card_id: { type: String, default: "" },
	created_date: String,
	updated_date: String,
	active_hash: String,
	forgot_hash: String,
	forgot_hash_date: String,
	is_professional_badge: { type: Number, default: 0 },
});

//Generating a hash for user password
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

//User object creation
var User = mongoose.model('User', userSchema);

//Category schema
var categorySchema = mongoose.Schema({	
	id: Number,
	category_name: String,
	category_desc: { type: String, default: '' },
	status: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],	
	created_date: String,
	updated_date: String	
});
var Category = mongoose.model('Category', categorySchema);

//Property Schema (Location schema)
var propertySchema = mongoose.Schema({
	id: Number,
	property_name: String,
	address1: String,
	address2: String,
	area: { type: String, default: '' },
	city: {type: String, default: '' },
	country: { type: String, default: '' },
	post_code: String,
	category: [{ type: Schema.Types.ObjectId, ref: 'Category' }], 
	category_id: [Number],
	property_desc: String,
	property_images: String,
	slug : String,
	user_id: Number,
	business_key: String,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	bounty: [{ type: Schema.Types.ObjectId, ref: 'Bounty' }],
	reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	average_rating: { type: Number, default: 0 },
	created_by: Number,
	status: { type: Number, default: 0 },
	bounty_set: { type: Number, default: 0 },
	bounty_token: { type: Number, default: 0 },
	bounty_type: { type: String, default: 0 },
	is_claimed: { type: Number, default: 0 },
	is_featured: { type: Number, default: 0 },
	feature_start_date: String,
	featured_end_date: String,
	featured_plan_id: Number,
	is_featured_plan_autorenew: { type: Number, default: 0 },
	created_date: String,
	updated_date: String
});
var Property = mongoose.model('Property', propertySchema);
//Product Schema

var productSchema = mongoose.Schema ({
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	product_name: String,
	product_image: String,
	product_description: String,
	price_in_tokens: Number,
	product_price: Number,
	product_type: Number,
	status: Number,
	product_review_title: String,
	product_review_description: String,
	created_date: String,
	updated_date: String
});
var Product = mongoose.model('Product', productSchema);

var Business_planSchema = mongoose.Schema({
	id: Number, 
    title: String,
    description: String, 
    amount: Number, 
    currency: String,
    status: Number, 
    created_date: String,
    updated_date: String
});
var Businessplan = mongoose.model('Businessplan', Business_planSchema);

//Claim Schema
var claimSchema = mongoose.Schema({
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	user_id: Number,
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	property_id: Number,
	status: Number,
	created_date: String	
});
var Claim = mongoose.model('Claim', claimSchema);

//Checkin Schema
/*var checkinSchema = mongoose.Schema({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	mood: String,
	status: Number,
	timestamp: Number,
	created_date: String,
	updated_date: String
});
var Checkin = mongoose.model('Checkin', checkinSchema);*/

//Review Schema
var reviewSchema = mongoose.Schema({	
	id: Number,
	is_guest: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	user_id: Number,
	property_id: Number,
	review_content: String,
	review_media: String,
	review_rating: Number,
	is_reply: Number,
	reply_text: String,
	status: Number,
	is_type:{ type: Number, default: 0 }, //0 = review 1 = checkin
	checkin_mood: { type: String, default: '' },
	ip_address: String,
	user_location: String,
	timestamp: Number,
	is_flagged: Number,
	flagged_users: [Number],
	created_date: String,	
	reply_created_date: String,	
	updated_date: String
});
var Review = mongoose.model('Review', reviewSchema);

// transactions Schema (My Orders)
var transactionsSchema = mongoose.Schema ({
	id: Number,
	type: Number, //Point/Token
	product: { type: Schema.Types.ObjectId, ref: 'Product' },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	from: { type: Schema.Types.ObjectId, ref: 'User' },
	amount: Number,
	operation: String, //minus,plus
	description: String, 
	status: Number,
	created_date: String,
	updated_date: String
});
var Transaction = mongoose.model('Transaction', transactionsSchema);

//followers Schema
var followersSchema = mongoose.Schema({
	id: Number,
	follower_user: { type: Schema.Types.ObjectId, ref: 'User' },
	following_user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	property_id: Number,
	type: Number,
	status: Number,	
	created_date: String,
	updated_date: String
});
var Follower = mongoose.model('Follower', followersSchema);

var likeSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	review: { type: Schema.Types.ObjectId, ref: 'Review' },
	review_emoji: String,
	status: Number,
	created_date: String
});
var Like = mongoose.model('Like', likeSchema);

//membership Schema
var membershipSchema = mongoose.Schema({	
	id: Number,
	membership_title: String,
	membership_image: String,
	membership_cost: String,
	status: Number,
	token_limit: Number,
	created_date: String,
	updated_date: String
});
var Membership = mongoose.model('Membership', membershipSchema);

// membershipRenewal Schema
var membershipRenewalSchema = mongoose.Schema({
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	membership: { type: Schema.Types.ObjectId, ref: 'Membership' },
	request_date: Number,
	effective_date: String,
	description: String,
	status: String,
	created_date: String,
	updated_date: String
});
var MembershipRenewal = mongoose.model('MembershipRenewal', membershipRenewalSchema);

//ReportLocation Schema
var ReportFlagSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: Number,
	report_type: { type: Number, default: 1 }, //1=user 2=property
	spam_user: Number,
	description: { type: String, default: '' },
	status: { type: Number, default: 0 },
	created_date: String,
	updated_date: String
});
var ReportFlag = mongoose.model('ReportFlag', ReportFlagSchema);

//token Log Schema
var tokenLogSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	from: { type: Schema.Types.ObjectId, ref: 'User' },
	token_amount: Number,
	operation: String,
	description: String,
	type: Number, //0-add location 1-add review 2-upvote review 3-
	status: Number,
	created_date: { type: Date, default: Date.now },
	updated_date: String	
});
var TokenLog = mongoose.model('TokenLog', tokenLogSchema);

//pointLogSchema Schema
var recentActivitySchema = mongoose.Schema({	
	id: Number,
	activity_type: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	description: String,
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	target_user: { type: Schema.Types.ObjectId, ref: 'User' },
	Product: { type: Schema.Types.ObjectId, ref: 'Product' },
	review:{type:Schema.Types.ObjectId, ref:'Review'},
	feeling:{type: String, default:""},
	status: Number,
	created_date: String,
	updated_date: String
});
var RecentActivity = mongoose.model('RecentActivity', recentActivitySchema);

//pointLogSchema Schema
var paymentHistorySchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	amount: Number,
	currency: String,
	tx_id: String,
	description: String,
	payment_type: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

//stanceLevel Schema
var stanceLevelSchema = mongoose.Schema({
	id: Number,
	start: Number,
	ends: Number,
	stancename: String,
	created_date: String,
});
var StanceLevel = mongoose.model('stanceLevel', stanceLevelSchema);

var SettingSchema = mongoose.Schema({
	id: Number,
	site_title: String,
	admin_email: String,
	developer_email: String,
	monthly_featuredmemberhip_token: Number,
	monthly_featuredmemberhip_flat: Number,
	yearly_featuredmemberhip_token: Number,
	yearly_featuredmemberhip_flat: Number,
	vat_percentage: Number,
	token_price_rate: Number,
});
var Setting = mongoose.model('setting', SettingSchema);

var badgeSchema = mongoose.Schema({
	id: Number,
	badge_title: String,
	badge_description: String,
	created_date: String,
	updated_date: String,
});
var Badge = mongoose.model('badge', badgeSchema);
module.exports = {
    User: User,
    Category: Category,
    Property: Property,
    Product: Product,
    Claim: Claim,
    //Checkin: Checkin,
    Review: Review,
    Transaction: Transaction,
    Follower: Follower,
    Like: Like,
    Membership: Membership,
    MembershipRenewal: MembershipRenewal,
    ReportFlag: ReportFlag,
    TokenLog: TokenLog,
    RecentActivity: RecentActivity,
    PaymentHistory: PaymentHistory,
	Businessplan: Businessplan,
	StanceLevel: StanceLevel,
	Setting: Setting,
	Badge: Badge,
}