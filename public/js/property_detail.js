$('.slider-for').slick({
       slidesToShow: 1,
       slidesToScroll: 1,
       arrows: false,
       fade: true,
       asNavFor: '.slider-nav'
});

$('.slider-nav').slick({
  slidesToShow: 5,
  slidesToScroll: 1,
  asNavFor: '.slider-for',
  dots: true,
  focusOnSelect: true
});
    
$('a[data-slide]').click(function(e) {
       e.preventDefault();
       var slideno = $(this).data('slide');
       $('.slider-nav').slick('slickGoTo', slideno - 1);
     });
     let modalId = $('#image-gallery');  

        $(document).ready(function(){
            $('.addReviewModel').on('click',function(){
              $('#addReviewModel').modal();
            });     
            
            $('.newCheckingModel').on('click', function () {
              $("#newCheckingModel").modal();
            });

            loadGallery(true, 'a.thumbnail');
        
            //This function disables buttons when needed
            function disableButtons(counter_max, counter_current) {
              $('#show-previous-image, #show-next-image')
                .show();
              if (counter_max === counter_current) {
                $('#show-next-image')
                  .hide();
              } else if (counter_current === 1) {
                $('#show-previous-image')
                  .hide();
              }
            }        
          
            function loadGallery(setIDs, setClickAttr) {
              let current_image,
                selector,
                counter = 0;
        
              $('#show-next-image, #show-previous-image')
                .click(function () {
                  if ($(this)
                    .attr('id') === 'show-previous-image') {
                    current_image--;
                  } else {
                    current_image++;
                  }
        
                  selector = $('[data-image-id="' + current_image + '"]');
                  updateGallery(selector);
                });
        
              function updateGallery(selector) {
                let $sel = selector;
                current_image = $sel.data('image-id');
                $('#image-gallery-title')
                  .text($sel.data('title'));
                $('#image-gallery-image')
                  .attr('src', $sel.data('image'));
                disableButtons(counter, $sel.data('image-id'));
              }
        
              if (setIDs == true) {
                $('[data-image-id]')
                  .each(function () {
                    counter++;
                    $(this)
                      .attr('data-image-id', counter);
                  });
              }
              $(setClickAttr)
                .on('click', function () {
                  updateGallery($(this));
                });
            }
          });
        
        // build key actions
$(document).keydown(function (e) {
  switch (e.which) {
    case 37: // left
      if ((modalId.data('bs.modal') || {})._isShown && $('#show-previous-image').is(":visible")) {
        $('#show-previous-image')
          .click();
      }
      break;

    case 39: // right
      if ((modalId.data('bs.modal') || {})._isShown && $('#show-next-image').is(":visible")) {
        $('#show-next-image')
          .click();
      }
      break;

    default:
      return; // exit this handler for other keys
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
});