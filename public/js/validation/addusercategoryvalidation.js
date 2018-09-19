$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

	$("form[name='categoryform']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
        rules:{
            category_name:{
                required:true,
                minlength:2,
                maxlength:30,
                alpha:true,
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
			category_name:{
				required:"Please enter category name",
                minlength: jQuery.validator.format("At least {0} characters are required"),
                maxlength: jQuery.validator.format("Maximum {0} characters are allowed")
			},
		},
		submitHandler:function(form){
			//form.submit();
            $.ajax({
              type: "POST",
              url: '/category/store',
              data : $('#categoryform').serialize(),
              success: function(data){
                console.log(data);
                if(data.status=='true'){
                    swal({
                      title: "Your Category was added successfully, it will be display once admin approve",
                      icon: "success",
                      dangerMode: true,
                      closeOnClickOutside: false,
                      closeOnEsc: false,
                    }).then((value) => {
                        window.location.reload();
                    }); 
                }else{
                    swal({
                        title: "Opps, Category Already Exist",
                        icon: "error",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    });
                }
              },
              error: function(){
                    swal({
                        title: "Opps, Something went wrong, please try after sometime",
                        icon: "error",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    });
              }
          });
		}
	});
});