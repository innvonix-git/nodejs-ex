$(function(){
	
	$.validator.addMethod("email",function(value,element){
		return this.optional(element) || /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(value);
        //return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
	},"Please enter a valid email address")

	$("form[name='loginform']").validate({
		rules:{
			email:{
				required:true,
				email:true,
			},
			password:{
				required:true,
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
			password:{
				required:"Please enter your password",
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
    var divHeight = $('.right-divn').height(); 
    $('.left-divn').css('height', divHeight+'px');
    $(window).on("load resize",function(e){
        if ($(window).width() <= 768) {  
          $('.left-divn').css('height', 'auto');
        }
        else{
         // $('.left-divn').css('height', divHeight+'px');
        }       
    });
});