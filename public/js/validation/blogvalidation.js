$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

    jQuery.validator.addMethod("noSpace", function(value, element) { 
      return value == '' || value.trim().length != 0;
    }, "Only Space are not allowed");

    jQuery.validator.addMethod("ck_edit", function(value, element) { 
      return CKEDITOR.instances['blog_content'].getData().replace(/<[^>]*>/gi, '').length != 0;
    }, "Please enter blog content");

    

	$("form[name='blogs_form']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
		rules:{
			blog_title:{
				required:true,
                noSpace:true,
                minlength:2,
                maxlength:50,
                normalizer: function(value) {return $.trim(value);}
			},
            blog_image:{
                //required:true,
                accept:"image/*",
                //extension: "jpeg|png|jpg",
            },
            blog_content:{
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
            else if (element.parents().hasClass('ck_blog')) {
                error.appendTo( element.parents('.ck_blog'));
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
			blog_title:{
				required:"Please enter blog title",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
			},
            blog_image:{
                required:"Blog Image is required",
                accept:"Please upload valid image",
            },
            blog_content:{
                required:"Post Content required",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});

    $("form[name='updateblogs_form']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
        rules:{
            blog_title:{
                required:true,
                noSpace:true,
                minlength:2,
                maxlength:50,
                normalizer: function(value) {return $.trim(value);}
            },
            blog_image:{
                //required:true,
                accept:"image/*",
                //extension: "jpeg|png|jpg",
            },
            blog_content:{
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
            else if (element.parents().hasClass('ck_blog')) {
                error.appendTo( element.parents('.ck_blog'));
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
            blog_title:{
                required:"Please enter blog title",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed"),
            },
            blog_image:{
                required:"Blog Image is required",
                accept:"Please upload valid image",
            },
            blog_content:{
                required:"Post Content required",
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });
});