var HomeController = require('../app/controllers/home');
var AdminHomeController = require('../app/controllers/adminHome');
var ListingController = require('../app/controllers/listing');
var BusinessController = require('../app/controllers/businessController');
var ReviewController = require('../app/controllers/reviewController.js');
var CategoryController = require('../app/controllers/categoryController.js');
var LocationController = require('../app/controllers/locationController.js');
var FrontListingController = require('../app/controllers/frontListingController.js');
var ClaimController = require('../app/controllers/claimController.js');
var apiController = require('../app/controllers/apiController.js');
var BlogsController = require('../app/controllers/blogsController.js');
var EmailController = require('../app/controllers/emailController.js');
var FlagController = require('../app/controllers/flagController.js');
var GeneralController = require('../app/controllers/generalController.js');
var CronController = require('../app/controllers/cronController.js');

var fs = require('fs');
var path = require('path');
var multer = require('multer');
var connect = require('connect');
var http = require('http');
var net = require('net'); 
var app = connect();
var requestIp = require('request-ip'); 
var share = require('social-share');
var where = require('node-where');
var request = require('request');

//var upload = multer({ dest: 'public/uploads/' });
var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null,file.fieldname +'_'+Math.floor(Math.random() * 1001)+'_'+ Date.now()+ path.extname(file.originalname));
    },
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    }
})
var upload = multer({ storage: storage });

//you can include all your controllers

module.exports = function (app, passport) {
    /*General Routes*/
    app.use(function(req, res, next){
        res.locals.req = req;
        res.locals.res = res;
        next();
    }); 

    /*Globa cache management script*/  
    app.use(function(req, res, next) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    });
 
    app.post('/signup', usernameToLowerCase, passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup',
        failureFlash: true 
    }));

    app.post('/login', usernameToLowerCase, passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    app.get('/sharetwitter',function(req, res) {
        var review = req.param('review')
        var prop_url =req.header('Referer');
    var url = share('twitter', {'title':review,'url':prop_url});
    res.redirect(url);
    });

    app.get('/sharefacebook',function(req, res) {
        var review = req.param('review')
        var prop_url =req.header('Referer');
    var url = share('facebook', {'title':review,'url':prop_url});
    res.redirect(url);
    });
    
    // app.post('/testCall', AdminHomeController.testCall);    
    // app.post('/api/testCall', AdminHomeController.testCall);    
    app.get('/', HomeController.showIndexPage);
    app.get('/about', HomeController.showAboutPage);
    app.get('/developer-help', HomeController.showDeveloperHelpPage);
    app.get('/contactus', HomeController.showContactUsPage);
    app.get('/terms', HomeController.showTermsPage);
    app.get('/privacy', HomeController.showPrivacyPage);
    app.get('/login', HomeController.showLoginPage);
    app.get('/signup', HomeController.showSignupPage);
    app.get('/forgotpassword', HomeController.showForgotPasswordPage);
    app.post('/sendforgotlink',HomeController.sendForgotPasswordLinkPage);
    app.post('/sendcontactusmail',HomeController.sendContactUsMailPage);
    app.post('/createpassword',HomeController.createNewPasswordPage);
    app.get('/logout', HomeController.logout);
    app.get('/activate/confirm',HomeController.confirm);
    app.get('/forgotpassword/confirm',HomeController.forgotPasswordConfirm);
    app.get('/home', HomeController.isLoggedIn, HomeController.showHomePage);
    app.get('/search', HomeController.showSearchPage);
    app.post('/search', HomeController.showSearchPage);
    app.get('/property/property-details',HomeController.isLoggedIn, HomeController.showPropertyDetailPage);
    app.get('/location/location-details', HomeController.showPropertyDetailPage);
    /*Front side Operations Routes*/
    app.get('/MyProfile', HomeController.isLoggedIn, HomeController.showProfilePage);
    app.get('/api/MyProfile', HomeController.showProfilePage);
    app.post('/updateprofile', upload.array('profile_photo',11), HomeController.isLoggedIn, HomeController.UpdateProfile);
    app.get('/changepassword',HomeController.isLoggedIn,HomeController.changePasswordPage);
    app.post('/updatepassword',HomeController.isLoggedIn,HomeController.updatePasswordPage);
    app.get('/Mylisting',HomeController.isLoggedIn, ListingController.showMyListingPage);
    app.get('/detailListing', HomeController.isLoggedIn, ListingController.showPropertyListingPage);
    app.get('/addListing', HomeController.isLoggedIn, ListingController.showCreateListingPage);
    app.post('/storeListing', upload.array('property_image',11), HomeController.isLoggedIn, ListingController.storePropertyListing);
    app.post('/updateListing', upload.array('property_image',11), HomeController.isLoggedIn, ListingController.updatePropertyListing);
    app.get('/editListing/:property', HomeController.isLoggedIn, ListingController.editPropertyListingPage);
    app.get('/deleteListing', HomeController.isLoggedIn, ListingController.deletePropertyListingPage);
    app.post('/addreview',upload.array('review_images',11),HomeController.isLoggedIn, HomeController.addReviewPage);
    app.post('/updatereview',upload.array('editreview_images',11),HomeController.isLoggedIn, HomeController.updateReviewPage);
    app.get('/deletereview', HomeController.isLoggedIn, HomeController.deleteReviewPage);
    app.post('/deletereplyreview', HomeController.isLoggedIn, HomeController.deletereplyReviewPage);
    app.get('/checkforaddreview', HomeController.isLoggedIn, HomeController.checkForAddReviewPage);
    app.get('/showFollowers', HomeController.isLoggedIn, HomeController.showFollowers);
    app.get('/showFollowings', HomeController.isLoggedIn, HomeController.showFollowings);
    app.get('/getEditReviewDetail', HomeController.isLoggedIn, HomeController.getEditReviewDetailPage);
    app.get('/business',ListingController.isLoggedIn, ListingController.showBusinessHomePage);
    app.post('/postreply',ListingController.isLoggedIn, ListingController.postReplyPage);
    app.get('/myclaimedroperties', ListingController.isLoggedIn, ListingController.showClaimPendingProperties);
    app.get('/myclaimedlocations', ListingController.isLoggedIn, ListingController.showClaimPendingProperties);
    app.get('/claimproperty', ListingController.isLoggedIn, ListingController.claimProperty);
    app.get('/claimlocation', ListingController.isLoggedIn, ListingController.claimProperty);
    app.get('/flags/:flagId/types/:typeId', HomeController.isLoggedIn, FlagController.reportFlag);

    app.get('/unclaimproperty', ListingController.isLoggedIn, ListingController.unclaimProperty);
    app.get('/unclaimlocation', ListingController.isLoggedIn, ListingController.unclaimProperty);
    app.get('/deleteClaim',ListingController.isLoggedIn, ClaimController.removeClaim);
    app.post('/location-api', apiController.getProperty);
    //app.get('/blogs', BlogController.showBlogsPage);
    //app.get('/blog', BlogController.showSingleBlogPage);
    app.get('/blogs', BlogsController.showBlogsPage);
    app.get('/blog', BlogsController.showSingleBlogPage);
    app.post('/checkforemail', HomeController.checkForEmailPage);
    app.post('/category/store', HomeController.isLoggedIn, CategoryController.storeUserCategoryPage);
    app.post('/setMembershipAutoRenew', HomeController.isLoggedIn, HomeController.setMembershipAutoRenewPage);
    app.get('/upgradeMembership', HomeController.isLoggedIn, HomeController.upgradeMembershipPage);
    
    app.get('/errorpage',function(req,res){
        res.render('errorpage',{
            error : req.flash("error"),
            success: req.flash("success"),
            session:req.session
        });
    });

    app.get('/ip',function(req, res) {
      where.is('192.168.137.22', function(err, result) {
        req.geoip = result;
        console.log(req.geoip);
      });
    });

    /* Admin Routes */
    app.post('/admin/login', passport.authenticate('admin-login',{
        successRedirect: '/admin/home',
        failureRedirect: '/admin/login',
        failureFlash: true
    }));
    app.get('/admin/logout', AdminHomeController.logout);
    app.get('/admin', AdminHomeController.loggedIn, AdminHomeController.home);//home home
    app.get('/admin/login', AdminHomeController.login);
    app.get('/admin/home', AdminHomeController.loggedIn, AdminHomeController.home);
    app.get('/admin/users', AdminHomeController.loggedIn, AdminHomeController.allUsers);
    app.get('/admin/business-users',AdminHomeController.loggedIn, AdminHomeController.allBusinessUsers);
    app.get('/admin/businessuser/approve', AdminHomeController.loggedIn, AdminHomeController.approveBusinessUser);
    app.get('/admin/businessuser/activate', AdminHomeController.loggedIn, AdminHomeController.activateBusinessUser);
    app.get('/admin/businessuser/suspend', AdminHomeController.loggedIn, AdminHomeController.suspendBusinessUser);
    app.get('/admin/userdetails',AdminHomeController.loggedIn, AdminHomeController.getUserDetails);
    app.get('/admin/categories', AdminHomeController.loggedIn, AdminHomeController.allCategories);
    app.get('/admin/addcategory', AdminHomeController.loggedIn,CategoryController.addCategoryPage);
    app.post('/admin/category/store', AdminHomeController.loggedIn, CategoryController.storeCategoryPage);
    app.post('/admin/category/update', AdminHomeController.loggedIn, CategoryController.updateCategoryPage);
    app.post('/admin/updateCategory', AdminHomeController.loggedIn, CategoryController.updateCategoryPage);
    app.get('/admin/editcategory', AdminHomeController.loggedIn, CategoryController.editCategoryPage);
    app.get('/admin/deletecategory', AdminHomeController.loggedIn, CategoryController.deleteCategoryPage);
    app.get('/admin/acceptcategory', AdminHomeController.loggedIn, CategoryController.acceptCategoryPage);
    app.get('/admin/rejectcategory', AdminHomeController.loggedIn, CategoryController.rejectCategoryPage);    
    app.get('/admin/locations',  AdminHomeController.loggedIn, LocationController.allProperties);
    app.get('/admin/approve-location', AdminHomeController.loggedIn, LocationController.approveLocation);
    app.get('/admin/activate-location', AdminHomeController.loggedIn, LocationController.activateLocation);
    app.get('/admin/reject-location',AdminHomeController.loggedIn, LocationController.rejectLocation);
    app.get('/admin/report-review',AdminHomeController.loggedIn, ReviewController.reportFlag);
    app.get('/admin/location-detail', AdminHomeController.loggedIn, LocationController.getDetailLocation);
    app.get('/admin/business-lists',AdminHomeController.loggedIn, BusinessController.getAllBusiness);
    app.get('/admin/business-detail',AdminHomeController.loggedIn, AdminHomeController.getBusinessUserDetails);
    app.get('/admin/reviews',AdminHomeController.loggedIn, ReviewController.getAllReviews);
    app.get('/admin/reviews/:reviewId',AdminHomeController.loggedIn, ReviewController.getAllReviewsById);
    app.get('/admin/users/approve', AdminHomeController.loggedIn, AdminHomeController.approveUser);
    app.get('/admin/users/active', AdminHomeController.loggedIn, AdminHomeController.activateUser);
    app.get('/admin/users/suspend', AdminHomeController.loggedIn, AdminHomeController.suspendUser);
    app.get('/admin/claimed-locations', AdminHomeController.loggedIn, ClaimController.getClaimedLocations);
    app.get('/admin/approve-claim', AdminHomeController.loggedIn, ClaimController.approvClaim);
    app.get('/admin/ignore-claim', AdminHomeController.loggedIn, ClaimController.ignoreClaim);
    app.get('/admin/flagged-reviews', AdminHomeController.loggedIn, ReviewController.getAllFlaggedReviews);
    app.get('/admin/blogs', AdminHomeController.loggedIn, BlogsController.allblogs);
    app.get('/admin/addblog', AdminHomeController.loggedIn, BlogsController.addblogPage);
    app.post('/admin/storeblogs',upload.single('blog_image'), BlogsController.storeblogs);
    app.get('/admin/editblog', AdminHomeController.loggedIn, BlogsController.editblogPage);
    app.post('/admin/updateblog',upload.single('blog_image'), BlogsController.updateblogPage);
    app.get('/admin/deleteblog', AdminHomeController.loggedIn, BlogsController.deleteblogPage);
    app.get('/admin/emails', AdminHomeController.loggedIn, EmailController.showemails);
    app.get('/admin/addemail', AdminHomeController.loggedIn, EmailController.addemailPage);
    app.post('/admin/storeemail', EmailController.storeemail);
    app.get('/admin/editemail', AdminHomeController.loggedIn, EmailController.editemailPage);
    app.post('/admin/updateemail', EmailController.updateemailPage);
    app.get('/admin/deleteemail', AdminHomeController.loggedIn, EmailController.deleteemailPage);
    app.get('/admin/flaggeduser', AdminHomeController.loggedIn, FlagController.flaggeduserList);
    app.get('/admin/flaggedlocation', AdminHomeController.loggedIn, FlagController.flaggedlocationList);
    app.get('/admin/featuredlisting', AdminHomeController.loggedIn, LocationController.featuredlistingPage);
    app.get('/admin/paymenthistory', AdminHomeController.loggedIn, BusinessController.paymenthistoryPage);
    app.get('/admin/rejectuserflag', AdminHomeController.loggedIn, AdminHomeController.rejectUserFlagRequest);
    app.get('/admin/rejectlocationflag', AdminHomeController.loggedIn, LocationController.rejectLocationFlagRequest);
    app.get('/admin/settings', AdminHomeController.loggedIn, AdminHomeController.adminSettingPage);
    app.get('/admin/editsettings', AdminHomeController.loggedIn, AdminHomeController.admineditSettingPage);
    app.post('/admin/updatesettings', AdminHomeController.loggedIn, AdminHomeController.adminupdateSetting);

    /*Adminside Ajax routes*/
    app.post('/admin/review/deleteReview', AdminHomeController.loggedIn, ReviewController.deleteReviewById);
    app.post('/admin/review/manageLike', AdminHomeController.loggedIn, ReviewController.manageLike);
    app.post('/admin/review/manageFlag', AdminHomeController.loggedIn, ReviewController.manageFlag);
    app.post('/admin/review/cancelFlaggedReview', AdminHomeController.loggedIn, ReviewController.cancelFlaggedReview);
    app.post('/admin/review/removeReviewReply', AdminHomeController.loggedIn, ReviewController.removeReviewReply);
    app.post('/admin/setprofesstionalbadge', AdminHomeController.loggedIn, HomeController.setProfesstionalBadge);    
    app.get('/admin/token-transfer', AdminHomeController.loggedIn, AdminHomeController.transferToken);
    app.post('/admin/transfer-token', AdminHomeController.loggedIn, AdminHomeController.transferTokenSave);

    /*Newly Added routes*/
    app.get('/feed',HomeController.feedPage);
    app.get('/shop',HomeController.shopPage);
    app.post('/checkin', HomeController.isLoggedIn, LocationController.CheckInPage);
    app.get('/checkforcheckin', HomeController.isLoggedIn, LocationController.checkForCheckInPage);
    app.get('/user/:userid/profile', HomeController.showUserProfile);
    app.get('/user/profile/follow/:id', HomeController.isLoggedIn, HomeController.followUser);
    app.get('/user/profile/unfollow/:id', HomeController.isLoggedIn, HomeController.unfollowUser);
    app.get('/user/location/follow/:id', HomeController.isLoggedIn, HomeController.followLocation);
    app.get('/user/location/unfollow/:id', HomeController.isLoggedIn, HomeController.unfollowLocation);
    app.get('/business-memberships', HomeController.isLoggedIn, BusinessController.getMembershipData);
    app.get('/business-plans/:plan_id/purchase',HomeController.isLoggedIn, BusinessController.purchaseMembershipPlan);
    app.get('/buy-token',HomeController.isLoggedIn, BusinessController.buyTokens);
    app.get('/location/:slug/details', HomeController.showPropertyDetailPage);
    app.get('/user-memberships', HomeController.isLoggedIn, HomeController.showUserMembership);
    app.get('/user-tokenlog', HomeController.isLoggedIn, HomeController.showUserTokenLogPage);
   
    app.get('/user-upgrademembership', HomeController.isLoggedIn, HomeController.showUserUpgradeMembership);
    app.get('/user-activity', HomeController.isLoggedIn, HomeController.showUserActivity);
    app.get('/user-redeem', HomeController.isLoggedIn, HomeController.showUserRedeem);
    app.get('/user-orderstatus', HomeController.isLoggedIn, HomeController.showUserOrderStatus);
    app.get('/user-referral', HomeController.isLoggedIn, HomeController.showUserReferral);
    app.get('/user-settings', HomeController.isLoggedIn, HomeController.showUserSettings);
    app.get('/request-category', HomeController.isLoggedIn, HomeController.showRequestCategory);

    app.post('/buy_token', HomeController.isLoggedIn, BusinessController.buyTokensProcess);
    app.post('/business_membership_purchase', HomeController.isLoggedIn, BusinessController.purchaseFeaturedMembership);
    app.get('/payment_details', HomeController.isLoggedIn, BusinessController.paymentForm);
    app.get('/unflags/:user_id/types/:flag_type', HomeController.isLoggedIn, FlagController.reportunFlag);
    app.post('/save_card', HomeController.isLoggedIn, BusinessController.storePaymentCard);
    app.get('/spam-location/:location', HomeController.isLoggedIn, FlagController.reportLocationSpam);
    app.get('/unspam-location/:location', HomeController.isLoggedIn, FlagController.reportLocationUnSpam);
    app.get('/get_search_autocomplete_data', GeneralController.getAutoCompleteData);
    app.get('/cron', CronController.setUserMembership);
    app.post('/get_locations_fiters', GeneralController.getLocationsByFilters);
    app.get('/update-slug', GeneralController.updateSlug);
}
/*    
app.post('/admin/login', function (req, res) {
    res.send('POST request to the homepage')
});
*/
function usernameToLowerCase(req, res, next){
    req.body.email = req.body.email.toLowerCase();
    next();
}
