$(function(){
	
	$.validator.addMethod("email",function(value,element){
		return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
	},"Please enter valid e-mail address")

	$("form[name='forgotpasswordform']").validate({
		rules:{
			email:{
				required:true,
				email:true,
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
			email:{
				required:"Please enter your e-mail address",
			},
		},
		submitHandler:function(form){
			form.submit();
		}
	});

	var divHeight = $('.reg-div').height(); 
    $(window).on("load resize",function(e){
        if ($(window).width() <= 768) {  
          $('.left-divn').css('height', 'auto');
        }
        else{
         // $('.left-divn').css('height', divHeight - 100 +'px');
        }       
    });

});