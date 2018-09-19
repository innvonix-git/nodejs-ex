$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

	$("form[name='checkInform']").validate({
        rules:{
            feeling:{
                required:true,
            },
            addstar:{
                required:true,
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
            else if (element.parents('div').hasClass('feeling-check')) {
                error.appendTo( element.parent().parent() );
            }
            else if (element.parents('div').hasClass('checkinForm')) {
                error.appendTo( element.parent().parent() );
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
			feeling:{
				required:"Please suggest your experience",
			},
            addstar:{
                required:"This location deserves how many stars?",
            }
		},
		submitHandler:function(form){
            console.log(form);
			//form.submit();
            console.log('a');
             $.ajax({
              type: "POST",
              url: '/checkin',
              data: ($("#checkInform").serialize()),
                success: function(data){
                  if(data.status==true){
                    swal({
                      title: "Checked In successfully",
                      icon: "success",
                      dangerMode: true,
                      closeOnClickOutside: false,
                      closeOnEsc: false,
                    }).then((value) => {
                        window.location.reload();
                    });
                  }else{
                    swal({
                        title: "Something went wrong",
                        icon: "error",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    }).then((value) => {
                      window.location.reload();
                    });
                  }
                }
              });
            }
	});
});