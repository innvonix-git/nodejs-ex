$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

	$("form[name='save_card']").validate({
        rules:{
            card_number:{
                required:true,
                minlength:16,
                maxlength:16,
                digits: true,
                normalizer: function(value) {return $.trim(value);}
            },
            expiration_month:{
                required:true,
                minlength:2,
                maxlength:2,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            expiration_year:{
                required:true,
                minlength:4,
                maxlength:4,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            cvv:{
                required:true,
                minlength:3,
                maxlength:3,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            accept_terms:{
                required: true,
            }
        },
        //
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
            else if (element.parents('label').hasClass('agreelabel')) {
                error.appendTo( element.parent() );
            }
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			card_number:{
				required:"Please enter card number",
                digits: "Only digits are allowed",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
			},
            expiration_month:{
                required:"Please enter expiry month",
                digits: "Only digits are allowed",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
            expiration_year:{
                required:"Please enter expiry year",
                digits: "Only digits are allowed",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
            cvv:{
                required:"Please enter CVV number",
                digits: "Only digits are allowed",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
            accept_terms:{
                required:"Please accept our terms and conditions"
            }
		},
		submitHandler:function(form){
			form.submit();
		}
	});
});