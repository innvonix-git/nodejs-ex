$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

	$("form[name='request_categoryform']").validate({
        rules:{
            category_name:{
                required:true,
                minlength:2,
                maxlength:30,
                alpha:true,
                normalizer: function(value) {return $.trim(value);}
            },
            category_desc:{
                required:true,
                minlength:10,
                maxlength:500,
                normalizer: function(value) {return $.trim(value);}
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
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			category_name:{
				required:"Please enter category name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
            category_desc:{
                required:"Please enter reason to add a category",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});
});