$(function(){

     $.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    });

	/*$.validator.addMethod("alpha",function(value,element){
		return this.optional(element) || /^[a-zA-Z]+$/.test(value);
	},"Please enter a valid name")*/

    // $.validator.addMethod("alpha_dash",function(value,element){
    //     return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    // },"Please enter a valid name")

	$.validator.addMethod("email",function(value,element){
		//return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/.test(value);
        return this.optional(element) || /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(value);
	},"Please enter a valid e-mail address")

	$("form[name='contactusform']").validate({
		rules:{
			contact_name:{
				required:true,
				alpha:true,
                minlength:2,
                maxlength:20,
                normalizer: function(value) {return $.trim(value);}
			},
			contact_email:{
				required:true,
				email:true,
                normalizer: function(value) {return $.trim(value);}
			},
			contact_subject:{
				required:true,
                minlength:5,
                normalizer: function(value) {return $.trim(value);}
			},
            contact_desc:{
                required:true,
                minlength:10,
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
			contact_name:{
				required:"Please enter your name",
                alpha: "Name may only contain letters and spaces",
                //alpha:"Name may only contain letters.",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
			contact_email:{
				required:"Please enter your e-mail address",
			},
            contact_subject:{
                required:"Please enter subject name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
            },
            contact_desc:{
                required:"Please enter message",
                minlength: jQuery.validator.format("At least {0} characters are required"),
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
     // div height for registeration page 
    var divHeight = $('.right-divn').height(); 
    $('.left-divn').css('height', divHeight+'px');

    $(window).on("load resize",function(e){
        if ($(window).width() <= 768) {  
          	$('.left-divn').css('height', 'auto');
        }
        else{
          	$('.left-divn').css('height', divHeight+'px');
        }       
    });
   
    $('.choice input[type=radio]').click(function(){
        $('.choice input[type=radio]').parent().removeClass('checked');
        $(this).parent().addClass('checked');
    });
});