$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid name");

    jQuery.validator.addMethod("noSpace", function(value, element) { 
      return value == '' || value.trim().length != 0;
    }, "Only Space are not allowed");

    jQuery.validator.addMethod("ck_edit", function(value, element) { 
      return CKEDITOR.instances['email_message'].getData().replace(/<[^>]*>/gi, '').length != 0;
    }, "Please enter email message");

    

	$("form[name='emails_form']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
		rules:{
			email_name:{
				required:true,
                noSpace:true,
                minlength:2,
                maxlength:50,
                normalizer: function(value) {return $.trim(value);}
			},
            email_subject:{
                required:true,
                noSpace:true,
                minlength:2,
                maxlength:100,
                normalizer: function(value) {return $.trim(value);}
            },
            email_message:{
                ck_edit:true,
                //required:true,
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

            // CKEditor
            else if (element.parents().hasClass('ck_email_message')) {
                error.appendTo( element.parents('.ck_email_message'));
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
			email_name:{
				required:"Please enter email name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
			},
            email_subject:{
                required:"Please enter email subject",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});

    $("form[name='updateemails_form']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
        rules:{
            email_name:{
                required:true,
                noSpace:true,
                minlength:2,
                maxlength:50,
                normalizer: function(value) {return $.trim(value);}
            },
            email_subject:{
                required:true,
                noSpace:true,
                minlength:2,
                maxlength:100,
                normalizer: function(value) {return $.trim(value);}
            },
            email_message:{
                ck_edit:true,
                //required:true,
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

            // CKEditor
            else if (element.parents().hasClass('ck_email_message')) {
                error.appendTo( element.parents('.ck_email_message'));
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
            email_name:{
                required:"Please enter email name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
            email_subject:{
                required:"Please enter email subject",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });
});