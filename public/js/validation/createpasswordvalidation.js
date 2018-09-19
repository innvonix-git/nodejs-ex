$(function(){
	
	$.validator.addMethod("noSpace", function (value, element) {
        //return this.optional(element) || /^[\s]$/i.test(value);
        return value.indexOf(" ") < 0 && value != ""; 
    });

    $.validator.addMethod("pass",function(value,element){
		return this.optional(element) || /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(value);
	},"Please enter valid password")

	$("form[name='createpasswordform']").validate({
		rules:{
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
			password:{
				required:"Please enter your password",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                noSpace: "No space allowed",
				//pass:"Password contain six characters with at least one letter and one number",
			},
			confirm_password:{
				required:"Please enter a confirm password",
				equalTo:"Password and Confirm Password does not match",
                noSpace: "No space allowed",
			},

		},
		submitHandler:function(form){
			form.submit();
		}
	});
});