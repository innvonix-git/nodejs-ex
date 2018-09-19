var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var request     = require('request');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var constants = require('../../config/constants'); 
var bodyParser = require('body-parser');
var Email     = require('../../app/models/email');
var emailtemplate = require('../../lib/forgotpassword.js');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'innvonix2016@gmail.com',
        pass: 'zcutblndftsrqbfl'
      }
}));

exports.sendMail = function(data) {
	console.log(data);
	var email_type = data.email_type;
	Email.findOne({id:email_type},function(err, emailData){
		if(err){
			req.flash('error', 'Error : something is wrong while sending email');
            res.redirect('/errorpage');
		}
		else{
			if(emailData){
				var template_type = parseInt(emailData.email_type);				
				switch (template_type) {
				    case 0:
				    	console.log('switch case 0');
				        break;
				    case 1:
				    	console.log('forgot password mail');
				    	var mail_content = emailData.email_message;
				    	var link = constants.host+'/forgotpassword/confirm?email='+data.receiver_email+'&active_link='+data.forgot_code;

				    	var email_body = mail_content.replace('{host_url}', constants.host);
				    	email_body = email_body.replace('{password_reset_link}',link);
				        break;
				    case 2:
				    	console.log('Normal User Account activation email');
				    	var mail_content = emailData.email_message;
				    	var link = constants.host+`/activate/confirm?email=`+data.receiver_email+`&active_link=`+data.activation_code;				    	
				    	var email_body = mail_content.replace('{host_url}', constants.host);
				    	email_body = email_body.replace('{password_activation_link}',link);
				    	email_body = email_body.replace('{user_name}',data.receiver_name);
				        break;
				    case 3:
				    	console.log('Business User Account activation email');
				    	var mail_content = emailData.email_message;
				    	var link = constants.host+`/activate/confirm?email=`+data.receiver_email+`&active_link=`+data.activation_code;				    	
				    	var email_body = mail_content.replace('{host_url}', constants.host);
				    	email_body = email_body.replace('{password_activation_link}',link);
				    	email_body = email_body.replace('{user_name}',data.receiver_name);
				        break;
				    case 4:
				    	console.log('Contact Us - Response Mail to User Side');
				    	var mail_content = emailData.email_message;
				    	var email_body = mail_content.replace('{host_url}', constants.host);
				    	email_body = email_body.replace('{user_name}',data.receiver_name);
				        break;
				    case 5:
				    	console.log('Contact Us - Request Mail to Admin Side');
				    	var mail_content = emailData.email_message;
				    	var email_body = mail_content.replace('{host_url}', constants.host);
				    	email_body = email_body.replace('{sender_name}',data.sender_name);
				    	email_body = email_body.replace('{sender_email}',data.sender_email);
				    	email_body = email_body.replace('{contact_subject}',data.contact_subject);
				    	email_body = email_body.replace('{contact_desc}',data.contact_desc);
				        break;
				    case 6:
				    	console.log('Location Approval Mail on Admin Approval');
				    	var mail_content = emailData.email_message;
				    	email_body = mail_content.replace('{user_name}',data.receiver_name);
				        break;
				    case 7:
				    	console.log('Location Deactivate Mail on Admin deactivate');
				    	var mail_content = emailData.email_message;
				    	email_body = mail_content.replace('{user_name}',data.receiver_name);
				        break;
				    case 8:
				    	console.log('Location Activate Mail on Admin Activate');
				    	var mail_content = emailData.email_message;
				    	email_body = mail_content.replace('{user_name}',data.receiver_name);
				        break;
				    case 9:
				    	console.log('Accept Category mail to user');
				    	var mail_content = emailData.email_message;
				    	email_body = mail_content.replace('{user_name}',data.receiver_name);
				        break;
				    case 10:
				    	console.log('Reject Category mail to user');
				    	var mail_content = emailData.email_message;
				    	email_body = mail_content.replace('{user_name}',data.receiver_name);
								break;
					case 11:
						console.log('Buy Token page');
						var mail_content = emailData.email_message;
						var email_body = mail_content.replace('{user_name}',data.receiver_name);
						email_body = email_body.replace('{paid_amount}',data.paid_amount);
						email_body = email_body.replace('{token_amount}',data.token_amount);
						email_body = email_body.replace('{purchase_date_time}',data.purchase_date_time);
						break;								
					case 12:
						console.log('Purchase Featured Membership');
						var mail_content = emailData.email_message;
						var email_body = mail_content.replace('{user_name}', data.receiver_name);
						email_body = email_body.replace('{paid_amount}', data.paid_amount);
						email_body = email_body.replace('{location_title}', data.location_title);
						email_body = email_body.replace('{purchase_date_time}', data.purchase_date_time);
					  default:
				    	console.log('default switch case');
				        break;
				}

				var email_data = `<!doctype html>
				<html>
				<head>
				<meta name="viewport" content="width=device-width">
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				<title>Special Request Form</title>
				<style>
				/* -------------------------------------
				    GLOBAL
				------------------------------------- */
				* {
				  font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif;
				  font-size: 100%;
				  line-height: 1.6em;
				  margin: 0;
				  padding: 0;
				}

				img {
				  max-width: 600px;
				  width: auto;
				}

				body {
				  -webkit-font-smoothing: antialiased;
				  height: 100%;
				  -webkit-text-size-adjust: none;
				  width: 100% !important;
				}


				/* -------------------------------------
				    ELEMENTS
				------------------------------------- */
				a {
				  color: #348eda;
				}

				.btn-primary {
				  Margin-bottom: 10px;
				  width: auto !important;
				}

				.btn-primary td {
				  background-color: #348eda; 
				  border-radius: 25px;
				  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
				  font-size: 14px; 
				  text-align: center;
				  vertical-align: top; 
				}

				div.content a:first-child {
				  background-color: #348eda;
				  border: solid 1px #348eda;
				  border-radius: 25px;
				  border-width: 10px 20px;
				  display: inline-block;
				  color: #ffffff;
				  cursor: pointer;
				  font-weight: bold;
				  line-height: 2;
				  text-decoration: none;
				}

				.last {
				  margin-bottom: 0;
				}

				.first {
				  margin-top: 0;
				}

				.padding {
				  padding: 10px 0;
				}

				/* -------------------------------------
				    BODY
				------------------------------------- */
				table.body-wrap {
				  padding: 20px;
				  width: 100%;
				}

				table.body-wrap .container {
				  border: 1px solid #f0f0f0;
				}


				/* -------------------------------------
				    FOOTER
				------------------------------------- */
				table.footer-wrap {
				  clear: both !important;
				  width: 100%;  
				}

				.footer-wrap .container p {
				  color: #666666;
				  font-size: 12px;
				  
				}

				table.footer-wrap a {
				  color: #999999;
				}


				/* -------------------------------------
				    TYPOGRAPHY
				------------------------------------- */
				h1, 
				h2, 
				h3 {
				  color: #111111;
				  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
				  font-weight: 200;
				  line-height: 1.2em;
				  margin: 40px 0 10px;
				}

				h1 {
				  font-size: 36px;
				}
				h2 {
				  font-size: 28px;
				}
				h3 {
				  font-size: 22px;
				}

				p, 
				ul, 
				ol {
				  font-size: 14px;
				  font-weight: normal;
				  margin-bottom: 10px;
				}

				ul li, 
				ol li {
				  margin-left: 5px;
				  list-style-position: inside;
				}

				/* ---------------------------------------------------
				    RESPONSIVENESS
				------------------------------------------------------ */

				/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
				.container {
				  clear: both !important;
				  display: block !important;
				  Margin: 0 auto !important;
				  max-width: 600px !important;
				}

				/* Set the padding on the td rather than the div for Outlook compatibility */
				.body-wrap .container {
				  padding: 20px;
				}

				/* This should also be a block element, so that it will fill 100% of the .container */
				.content {
				  display: block;
				  margin: 0 auto;
				  max-width: 600px;
				}

				/* Let's make sure tables in the content area are 100% wide */
				.content table {
				  width: 100%;
				}

				</style>
				</head>

				<body bgcolor="#f6f6f6">

				<!-- body -->
				<table class="body-wrap" bgcolor="#f6f6f6">
				  <tr>
				    <td></td>
				    <td class="container" bgcolor="#FFFFFF">

				      <!-- content -->
				      <div class="content">
				      	<!--<table>
				          <tr>
				            <td>-->
				            	`+email_body+`
				            <!--</td>
				          </tr>
				        </table>-->
				      </div>
				        <p>Thanks, have a lovely day! </p>
	            		<p><a href="`+constants.host+`">The Revstance Team</a></p>
				      <!-- /content -->
				      
				    </td>
				    <td></td>
				  </tr>
				</table>
				<!-- /footer -->

				</body>
				</html>`;

				const mailOptions = {
			      from: 'innvonix2016@gmail.com', // sender address
			      to: data.receiver_email, // list of receivers
			      subject: emailData.email_subject, // Subject line
			      html: email_data
				};
				
				transporter.sendMail(mailOptions, function (err, info) {
			   		if(err)
			     		console.log(err)
			   		else
			     		console.log(info);
				});
			}
		}
	})
}