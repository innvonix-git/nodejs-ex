$(function(){

    $.validator.addMethod("alpha",function(value,element){
        return this.optional(element) || /^[a-zA-Z]+$/.test(value);
    },"Please enter a valid name")

    $.validator.addMethod("alphaNumeric",function(value,element){
        return this.optional(element) || /^[a-zA-Z0-9 ]+$/.test(value);
    },"Please enter a valid post code")

    $.validator.addMethod("email",function(value,element){
        return this.optional(element) || /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(value);
    },"Please enter a valid e-mail address")

    $.validator.addMethod("pass",function(value,element){
        return this.optional(element) || /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(value);
    },"Please enter valid password")

    $.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != ""; 
    });

    function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

    $.validator.addMethod("maxDate", function(value, element) {
        var curDate = new Date();
        var c = curDate.getFullYear()+'-'+addZero(curDate.getMonth()+1)+'-'+curDate.getDate();
        var Cdate = new Date(c);
        var inputDate = new Date(value);
        var current_stamp = Cdate.getTime();
        //console.log("c_"+current_stamp);
        var input_stamp = inputDate.getTime();
        //console.log("i_"+input_stamp);
        return this.optional(element) || (input_stamp <= current_stamp)
    }, "Please enter valid date of birth"); 

    $("form[name='userprofileform']").validate({
        rules:{
            first_name:{
                required:true,
                minlength: 2,
                alpha:true,
                normalizer: function(value) {return $.trim(value);}
            },
            last_name:{
                required:true,
                minlength: 2,
                alpha:true,
                normalizer: function(value) {return $.trim(value);}
            },
            contact_number:{
                digits: true,
                min:1,
                minlength: 10,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
            },
            dob:{
                maxDate: true,
            },
            gender:{
                required: true,
                normalizer: function(value) {return $.trim(value);}
            },
            address1:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            address2:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            area:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            city_name:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            business_address1:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            business_area:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            country_name:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            ethnicity:{
                normalizer: function(value) {return $.trim(value);}
            },
            tag_line:{
                normalizer: function(value) {return $.trim(value);}
            },
            post_code:{
                //digits: true,
                //min:1,
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
            else if (element.parents('div').hasClass('gender-div')) {
                error.appendTo( element.parent() );
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
                required:"Please enter first name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                alpha:"The first name may only contain letters"
            },
            last_name:{
                required:"Please enter last name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                alpha:"The last name may only contain letters"
            },
            gender:{
                required: "Please select gender"
            },
            business_address1:{
                required:"Please enter business address",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            business_area:{
                required:"Please enter business area",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            address1:{
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            area:{
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            contact_number:{
                digits: "Enter only digits",
                min: "Please enter valid contact number",
                minlength: jQuery.validator.format("At least {0} digits are required"),
                maxlength: jQuery.validator.format("Maximum {0} digits are allowed"),
            },
            city_name:{
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            country_name:{
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            post_code:{
                alphaNumeric: "Please enter valid post code",
                minlength: "Please enter valid post code",
                maxlength: "Please enter valid post code",
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });

    $("form[name='businessprofileform']").validate({
        rules:{
            first_name:{
                required:true,
                minlength: 2,
                alpha:true,
                normalizer: function(value) {return $.trim(value);}
            },
            last_name:{
                required:true,
                minlength: 2,
                alpha:true,
                normalizer: function(value) {return $.trim(value);}
            },
            dob:{
                maxDate: 0,
            },
            gender:{
                required: true,
                normalizer: function(value) {return $.trim(value);}
            },
            contact_number:{
                required:true,
                digits: true,
                min:1,
                minlength: 10,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
            },
            business_address1:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            business_area:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            address1:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            address2:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            area:{
                required:true,
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            city_name:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            country_name:{
                minlength: 2,
                maxlength: 20,
                normalizer: function(value) {return $.trim(value);}
            },
            ethnicity:{
                normalizer: function(value) {return $.trim(value);}
            },
            tag_line:{
                normalizer: function(value) {return $.trim(value);}
            },
            post_code:{
                required:true,
                //digits: true,
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
                required:"Please enter first name",
                alpha:"The first name may only contain letters"
            },
            last_name:{
                required:"Please enter last name",
                alpha:"The last name may only contain letters"
            },
            gender:{
                required: "Please select gender"
            },
            business_address1:{
                required:"Please enter business address",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            business_area:{
                required:"Please enter business area",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            address1:{
                required:"Please enter address",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            address2:{
                required:"Please enter address",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            area:{
                required:"Please enter area",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
            contact_number:{
                required:"Please enter contact number",
                digits: "Enter only digits",
                min: "Please enter valid contact number",
                minlength: jQuery.validator.format("At least {0} digits are required"),
                maxlength: jQuery.validator.format("Maximum {0} digits are allowed"),
            },
            post_code:{
                required:"Please enter post code",
                alphaNumeric: "Please enter valid post code",
                minlength: "Please enter valid post code",
                maxlength: "Please enter valid post code",
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });
});