$(function(){
    $('input[type="radio"]').click(function(){
        var test = $(this).val();
        $(".signupbtn").hide();
        $("#signupbtn" + test).show();
        $("#signupbtn" + test).focus();
    });
    $('#signupbtn2').click(function(){
        var form = $("#registrationform");
        form.validate();
        if(form.valid()){
            //
            $('div#existmailmessage').empty();
            var emailid = $("input[name=email]").val();
            $.ajax({
              method: 'post',
              url:'/checkforemail',
              data: {emailid:emailid},
              success:function(result){
                if(result.status==true){
                    $("#signup0").hide();
                    $("#signup1").show();
                    $("#signupbtn0").show();
                    $("#signupbtn2").show();
                    $("#signupbtn1").hide();
                }else{
                    $("div#existmailmessage").append("This email address already exists");
                }
              }
            })
            //alert('valid');
        }
    });
    $('#signupbtn0').click(function(){
        $("#signup0").show();
        $("#signup1").hide();
        $("#signupbtn1").hide();
        $("#signupbtn0").hide();
        $("#signupbtn2").show();
    });

	$.validator.addMethod("alpha",function(value,element){
		return this.optional(element) || /^[a-zA-Z]+$/.test(value);
	},"Please enter a valid name")

    // $.validator.addMethod("alpha_dash",function(value,element){
    //     return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    // },"Please enter a valid name")

	$.validator.addMethod("email",function(value,element){
		//return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
        return this.optional(element) || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm.test(value);
	},"Please enter a valid e-mail address")

	$.validator.addMethod("pass",function(value,element){
		return this.optional(element) || /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(value);
	},"Please enter valid password")

    $.validator.addMethod("noSpace", function (value, element) {
        //return this.optional(element) || /^[\s]$/i.test(value);
        return value.indexOf(" ") < 0 && value != ""; 
    });

    $.validator.addMethod("alphaNumeric",function(value,element){
        return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
    },"Please enter a valid post code");

	// $.validator.addMethod("email",function(value,element){
	// 	return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
	// },"email like name@domain.com")

	$("form[name='registrationform']").validate({
		rules:{
			first_name:{
				required:true,
				alpha:true,
                minlength:2,
                maxlength:20,
                normalizer: function(value) {return $.trim(value);}
			},
			last_name:{
				required:true,
				alpha:true,
                minlength:2,
                maxlength:20,
                normalizer: function(value) {return $.trim(value);}
			},
			email:{
				required:true,
				email:true,
                normalizer: function(value) {return $.trim(value);}
			},
			// contact_number:{
   //              digits: true,
   //              greaterThanZero:true,
   //              minlength: 10,
   //              maxlength: 15,
			// },
			password:{
				required:true,
				minlength:6,
				//pass:true,
                noSpace: true,
			},
			confirm_password:{
				required:true,
				equalTo: "#password",
                noSpace: true,
			},
			user_type:{
				required:true,
			},
			business_name:{
				required:true,
                normalizer: function(value) {return $.trim(value);}
			},
			address1:{
				required:true,
                normalizer: function(value) {return $.trim(value);}
			},
            area:{
                required:true,
                normalizer: function(value) {return $.trim(value);}
            },
			business_contact:{
				required:true,
                digits: true,
                min:1,
                minlength: 10,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
			},
            business_postcode:{
                required:true,
                alphaNumeric: true,
                minlength: 3,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
            },
		},
		highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
            $(element).addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
            $(element).removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            }
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else if (element.parents('div').hasClass('choice')){
                error.appendTo( element.parent().parent().parent().parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		messages:{
			first_name:{
				required:"Please enter your first name",
                alpha:"The first name may only contain letters",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			last_name:{
				required:"Please enter your last name",
                alpha:"The last name may only contain letters",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			email:{
				required:"Please enter your e-mail address",
			},
			// contact_number:{
			// 	digits:"Enter Valid Contact Number",
			// 	minlength:"Please enter a valid contact number",
			// 	maxlength:"Please enter a valid contact number",
			// },
			password:{
				required:"Please enter your password",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                noSpace: "No space allowed.",
				//pass:"Password contain six characters with at least one letter and one number",
			},
			confirm_password:{
				required:"Please enter a confirm password",
				equalTo:"Password and Confirm Password does not match",
                noSpace: "No space allowed.",
			},
			user_type:{
				required:"Please select user type",
			},
            business_name:{
                required:"Please enter your business name",
            },
            address1:{
                required:"Please enter your address",
            },
            area:{
                required:"Please enter your area",
            },
            business_contact:{
                required:"Please enter your contact number",
                digits: "Enter only digits",
                min: "Please enter valid contact number",
                minlength: jQuery.validator.format("At least {0} digits are required"),
                maxlength: jQuery.validator.format("Maximum {0} digits are allowed"),
            },
            business_postcode:{
                required:"Please enter your post code",
                alphaNumeric: "Please enter valid post code",
                minlength: "Please enter valid post code",
                maxlength: "Please enter valid post code",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});

	$(window).scroll(function(){
        var sticky = $('#navbar'),
            scroll = $(window).scrollTop(),
            body = $('body');
        if (scroll >= 5){
          sticky.addClass('navbar-fixed fixed-top');
          body.addClass('navbar-fixed');
          }
        else {
          sticky.removeClass('navbar-fixed fixed-top');
          body.removeClass('navbar-fixed');
          }
    });
    // Floating labels
    var onClass = "on";
    var showClass = "is-visible";

    // Setup
    $("input:not(.token-input):not(.bootstrap-tagsinput > input), textarea, select").on("checkval change", function () {
        // Define label
        var label = $(this).parents('.form-group-material').children(".control-label");

        // Toggle label
        if (this.value !== "") {
            label.addClass(showClass);
        }
        else {
            label.removeClass(showClass).addClass('animate');
        }
    }).on("keyup", function () {
        $(this).trigger("checkval");
    }).trigger("checkval").trigger('change');

    // Remove animation on page load
    $(window).on('load', function() {
        $(".form-group-material").children('.control-label.is-visible').removeClass('animate');
    });   
     // div height for registeration page 
    var divHeight = $('.right-divn').height(); 

    $(window).on("load resize",function(e){
        if ($(window).width() <= 768) {  
          	$('.left-divn').css('height', 'auto');
        }
        else{
          //	$('.left-divn').css('height', divHeight+'px');
        }       
    });
   
    $('.choice input[type=radio]').click(function(){
        $('.choice input[type=radio]').parent().removeClass('checked');
        $(this).parent().addClass('checked');
    });
});