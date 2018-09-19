$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

	$("form[name='categoryform']").validate({
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
                if(element.parents('div').hasClass('error_msg')){

                error.appendTo('.addreviewfilemargin');
                }
                else{   
                error.insertAfter(element);
                }
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
			//form.submit();
            $('.alert-success').hide();
            $('.alert-danger').hide();
            $('.alert-success span').html('');
            $('.alert-danger span').html('');
            $.ajax({
                type: "POST",
                url: '/category/store',
                data: ($("#categoryform").serialize()),
                success: function(data){
                    console.log(data);
                    console.log(data.status);
                    if(data.status=='true'){
                        $('.alert-success span').append('Category requested successfully, it will be display after admin approval');
                        $('.alert-success').show();
                        /*swal({
                        title: "Category requested successfully, it will be display after admin approval",
                        icon: "success",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        }).then((value) => {
                            //window.location.reload();
                        });*/
                        //$('#addCategoryModel').modal('hide');
                        //$('#category_name').val('');
                        //$('#category_desc').val('');
                        
                    } else if(data.status=='exist'){
                        $('.alert-danger span').append('Category Already Exists');
                        $('.alert-danger').show();
                        /*swal({
                        title: "Category Already Exists",
                        icon: "error",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        }).then( (value) =>{
                           //window.location.href();
                        });*/
                        //$('#addCategoryModel').modal('hide');
                        //$('#category_name').val('');
                        //$('#category_desc').val('');
                        
                    }else{
                        $('.alert-danger span').append('Category requested successfully, it will be display after admin approval');
                        $('.alert-danger').show();
                       /*swal({
                        title: "Category requested successfully, it will be display after admin approval",
                        icon: "success",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        }).then((value) => {
                            //window.location.reload();
                        });*/
                        $('#addCategoryModel').modal('hide');
                        $('#category_name').val('');
                        $('#category_desc').val('');
                        
                    }
                },
                error: function(){
                    $('.alert-danger span').append('Opps, Something went wrong, please try after sometime');
                        $('.alert-danger').show();
                    /*swal({
                        title: "Opps, Something went wrong, please try after sometime",
                        icon: "error",
                        dangerMode: true,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    });*/
                }
            });
		}
	});
});