$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid name");

    $.validator.addMethod("email",function(value,element){
        //return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
        return this.optional(element) || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm.test(value);
    },"Please enter a valid e-mail address");

    $.validator.addMethod("dig",function(value,element){
        return this.optional(element) || /^[0-9.]+$/.test(value);
    },"Please enter a valid rate")

	$("form[name='settingsform']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
        rules:{
            site_title:{
                alpha:true,
                required:true,
                minlength:2,
                maxlength:30,
                normalizer: function(value) {return $.trim(value);}
            },
            admin_email:{
                required:true,
                minlength:2,
                maxlength:30,
                email:true,
                normalizer: function(value) {return $.trim(value);}
            },
            developer_email:{
                required:true,
                minlength:2,
                maxlength:30,
                email:true,
                normalizer: function(value) {return $.trim(value);}
            },
            monthly_featuredmemberhip_token:{
                required:true,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            monthly_featuredmemberhip_flat:{
                required:true,                
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            yearly_featuredmemberhip_token:{
                required:true,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            yearly_featuredmemberhip_flat:{
                required:true,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
            token_price_rate:{
                required:true,
                dig:true,
                normalizer: function(value) {return $.trim(value);}
            },
            vat_percentage:{
                required:true,
                min:1,
                max:100,
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
        },
        //
        highlight: function(element, errorClass) {
            $(element).removeClass(errorClass);
        },
        unhighlight: function(element, errorClass) {
            $(element).removeClass(errorClass);
        },  
        errorPlacement: function(error, element) {
            // Unstyled checkboxes, radios
            if (element.parents().hasClass('form-check')) {
                error.appendTo( element.parents('.form-check').parent() );
            }

            // Input with icons and Select2
            else if (element.parents().hasClass('form-group-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }

            // Input group, styled file input
            else if (element.parent().is('.uniform-uploader, .uniform-select') || element.parents().hasClass('input-group')) {
                error.appendTo( element.parent().parent() );
            }

            // Other elements
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			site_title:{
				required:"Please enter site title",
                alpha:"Please enter valid name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
			},
            admin_email:{
                required:"please enter admin email",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
                email:"please enter valid email",
                normalizer: function(value) {return $.trim(value);}
            },
            developer_email:{
                required:"please enter admin email",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
                email:"please enter valid email",
                normalizer: function(value) {return $.trim(value);}
            },
            monthly_featuredmemberhip_token:{
                required:"please enter token value",
                digits:"only digits are allowed",
                normalizer: function(value) {return $.trim(value);}
            },
            monthly_featuredmemberhip_flat:{
                required:"please enter token value",
                digits:"only digits are allowed",
                normalizer: function(value) {return $.trim(value);}
            },
            yearly_featuredmemberhip_token:{
                required:"please enter token value",
                digits:"only digits are allowed",
                normalizer: function(value) {return $.trim(value);}
            },
            yearly_featuredmemberhip_flat:{
                required:"please enter token value",
                digits:"only digits are allowed",
                normalizer: function(value) {return $.trim(value);}
            },
            token_price_rate:{
                required:"please enter token price rate",
                normalizer: function(value) {return $.trim(value);}
            },
            vat_percentage:{
                required:"please enter VAT in percentage",
                min:jQuery.validator.format("Minimum {0} digits are required"),
                max:jQuery.validator.format("Maximum {0} digits are allowed"),
                digits:true,
                normalizer: function(value) {return $.trim(value);}
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});
});