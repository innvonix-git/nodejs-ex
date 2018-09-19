$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

    $.validator.addMethod("minusAllow", function(value, element) {
        return this.optional(element) || value == value.match(/^[\+\-]?[0-9]*(?:\.[0-9]+)?$/);
    },"Please enter valid token amount");

    $.validator.addMethod("zeroNotAllow", function(value, element) {
        return this.optional(element) || value == value.match(/^[\+\-]?[1-9][0-9]*$/);
    },"Please enter valid token amount");

	$("form[name='transfertokenForm']").validate({
        ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
        errorClass: 'validation-invalid-label',
        validClass: 'validation-valid-label',
        rules:{
            user:{
                required: true,
            },
            amount:{
                required:true,
                minusAllow:true,
                zeroNotAllow: true,
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
            user:{
                required: "Please select user"
            },
			amount:{
				required:"Please enter STT amount",
                minusAllow: "Please enter valid STT amount",
                zeroNotAllow: "You cannot transfer 0 STT"
			},
		},
		submitHandler:function(form){
            var amt = $('#amount').val();
            var text = '';
            if(amt>0){
                text = 'Are you sure you want to transfer STT to this user?';
            }else{
                text = 'Are you sure you want to deduct STT from this user?';
            }
            swal({
            title: text,
            type: "warning",
            icon: "warning",
            buttons: [
                'Cancel',
                'Confirm'
            ],
            dangerMode: true,
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            }).then(function(confirm) {
                if (confirm === true) {
                    form.submit();
                }
            });
		}
	});
});