$(function(){

	$.validator.addMethod('maxfile', function (value, element, param) {
    return this.optional(element) || (element.files.length <= 10)
}, 'Maximum 10 location images are allowed');

	$.validator.addMethod("alphaNumeric",function(value,element){
        return this.optional(element) || /^[a-zA-Z0-9 ]+$/.test(value);
    },"Please enter a valid post code");

	$("form[name='createbulistingform']").validate({
		rules:{
			property_name:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			address1:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},			
			area:{
				required: true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			postcode:{
				required:true,
				alphaNumeric: true,
				minlength: 3,
                maxlength: 15,
				normalizer: function(value) {return $.trim(value);}
			},
			city:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			country:{
				required:true,
				normalizer: function(value) {return $.trim(value);}
			},
			categories:{
				required:true,
			},
			property_image:{
				required:true,
				maxfile:true,
				//extension: "jpeg|png|jpg",
			},
			property_desc:{
				minlength:2,
                maxlength:500,
				required:true,
				normalizer: function(value) {return $.trim(value);}
			},
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
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			property_name:{
				required:"Please enter location name",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			address1:{
				required:"Please enter location address",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			area:{
				required:"Please enter location area",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")	
			},
			postcode:{
				required:"Please enter location post code",
				alphaNumeric: "Please enter valid post code",
				minlength: "Please enter valid post code",
                maxlength: "Please enter valid post code",			
			},
			city:{
				required:"Please enter location city",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			country:{
				required:"Please enter location country",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			categories:{
				required:"Please select at least one category",
			},
			property_image:{
				required:"Please upload images",
				//extension:"Please Upload only jpeg or png images",
			},
			property_desc:{
				required:"Please enter location description",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
		},
		submitHandler:function(form){
			form.submit();
		}
	});

	$("form[name='createfelistingform']").validate({
		rules:{
			property_name:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			address1:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			area:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			categories:{
				required:true,
			},
			property_image:{
				maxfile:true,
			},
			postcode:{
				required:true,
				alphaNumeric: true,				 
                minlength: 3,
                maxlength: 15,
				normalizer: function(value) {return $.trim(value);}
			},
			city:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			country:{
				required:true,
				minlength:2,
                maxlength:20,
				normalizer: function(value) {return $.trim(value);}
			},
			property_desc:{
				required:true,
				minlength:2,
                maxlength:500,
				normalizer: function(value) {return $.trim(value);}
			},
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
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			property_name:{
				required:"Please enter location name",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			address1:{
				required:"Please enter location address",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			area:{
				required:"Please enter location area",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			categories:{
				required:"Please select at least one category",
			},
			postcode:{
				required:"Please enter location post code",
				alphaNumeric: "Please enter valid post code",
				minlength: "Please enter valid post code",
                maxlength: "Please enter valid post code",
			},
			city:{
				required:"Please enter location city",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			country:{
				required:"Please enter location country",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			property_image:{
				required:"Please upload images",
				//extension:"Please Upload only jpeg or png images",
			},
			property_desc:{
				required:"Please enter location description",
				minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
		},
		submitHandler:function(form){
			form.submit();
		}
	});
});