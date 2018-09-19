var LocalStrategy   = require('passport-local').Strategy;
var models          = require('../app/models/revstance_models');
var User            = models.User;
var Like            = models.Like;
var Flag            = models.Flag;
var ReportFlag = models.ReportFlag;
var bcrypt          = require('bcrypt-nodejs');
var configAuth      = require('./auth.js');
var constant        = require('../config/constants');
var dateFormat      = require('dateformat');
var fs              = require('fs');
var bcrypt          = require('bcrypt-nodejs');
var dynamicmail  = require('../app/controllers/dynamicMailController');
var crypto          = require("crypto");


//expose this function to our app using module.exports
module.exports = function(passport) {

   passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // === LOCAL SIGNUP =
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'mail' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('error', 'This email address already exists.'));
            } else {
            User.find().sort([['id', 'descending']]).limit(1).exec(function(err, userdata) { 
            var newUser = new User();
            var day = getDate();           
            var id = crypto.randomBytes(3).toString('hex');
            User.findOne ({'wallet_id' : id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    var id = crypto.randomBytes(3).toString('hex');  
                    return done(null, false, req.flash('error', 'Wallet ID already exists.'));
                }
              });     
              var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
                    if(userdata.length>0){                        
                        newUser.id = userdata[0].id+1;                    
                    }else{
                        newUser.id = 1;
                    }  
                    newUser.first_name = req.body.first_name;
                    newUser.last_name = req.body.last_name;
                    newUser.mail    = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.user_type = req.body.user_type;
                    newUser.status = 0;
                    if(req.body.user_type==2){
                        var email_type = 3;
                        newUser.postcode = req.body.business_postcode;
                        newUser.contact_number = req.body.business_contact;
                        newUser.business_name = req.body.business_name;
                        newUser.business_address1 = req.body.address1;
                        newUser.business_address2 = "";
                        newUser.business_area = req.body.area;
                        newUser.business_contact_number = req.body.business_contact;
                    }else{
                        var email_type = 2;
                    }
                    newUser.membership = req.app.locals.default_membership;
                    newUser.next_membership_plan = req.app.locals.default_membership;
                    newUser.token_balance = 10;
                    newUser.ip_address = req.ip;                    
                    newUser.is_influencer = 0;
                    newUser.wallet_id = id;
                    newUser.badges = [];
                    newUser.auto_renew = 1;
                    newUser.created_date = day;
                    newUser.updated_date = day;
                    newUser.active_hash = active_code;                    
                    newUser.property = [];
                    newUser.save(function(err) {
                    if (err){
                        req.flash('User registration failed');
                        return done(err);
                    }   
                    var sendmail = {
                        receiver_name: req.body.first_name,
                        receiver_email: req.body.email,
                        activation_code: active_code,
                        user_type: req.body.user_type,
                        email_type: email_type
                    }
                    dynamicmail.sendMail(sendmail);
                    return done(null, newUser,req.flash('success', 'Your account has been created successfully. Please check your email to activate your account.'));                    
                    req.session.destroy();                
                });                
              });
            }
        });
    });        
}));

    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
     User.findOne({ 'mail' :  email }, function(err, user) {
            if (err)
            return done(null, false, req.flash('error', err)); // req.flash is the way to set flashdata using connect-flash

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // req.flash is the way to set flashdata using connect-flash          
            
            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // create the loginMessage and save it to session as flashdata

            if(user.status === 0)
             return done(null, false, req.flash('error', 'Your account is not yet activated, please verify your account to login.'));

             if(user.status === 3)
             return done(null, false, req.flash('error', 'Your account is suspended'));

            if(user.user_type === 3)
             return done(null, false, req.flash('error', 'You can not login with admin account'));
             /* Get User Flags and Likes*/
            var likedReviews = [];
            var flagedReviews = [];
            var flaggedUsers = [];

            ReportFlag.find({},function(err,reportflag){
                if(err){
                    console.log("password Login successful Find Report Flag Error");
                    res.send('errorpage');
                }
                reportflag.forEach(function(reportuser){
                    flaggedUsers.push(reportuser.spam_user);
                });

            Like.find({user_id:user.id}, function(err, likes) {
                if(err){
                    console.log("password Login successful Find Liked Reviews Error");
                    res.send('errorpage');
                }
                likes.forEach(function(like){
                    likedReviews.push(like.review_id);
                });               
                    if(req.body.ip_address){
                        req.session.ip_address = req.body.ip_address;
                    }else{
                        req.session.ip_address = '127.0.0.1';
                    }
                    if(req.body.country){
                        req.session.country = req.body.country;
                    }else{
                        req.session.country = 'India';
                    }
                    req.session.user = user;
                    req.session.likedReviews = likedReviews;
                    req.session.flaggedUsers = flaggedUsers;
                    req.session.flagedReviews = [];
                    req.flash('error','Login done');
                    return done(null, user);
                });
            /* Get User Flags and Likes*/
            })
        });
    }));

    /*Admin Login*/
    passport.use('admin-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        User.findOne({ 'mail' :  email,'user_type' : 3}, function(err, user) {
            if (err)
            return done(null, false, req.flash('error', err)); // req.flash is the way to set flashdata using connect-flash
            if (!user)
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // req.flash is the way to set flashdata using connect-flash
            if (!user.validPassword(password))
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // create the loginMessage and save it to session as flashdata
            req.session.user = user;        
            return done(null, user);
        });
    }));
};

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }