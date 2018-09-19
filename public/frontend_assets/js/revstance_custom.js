$(document).ready(function () {
    $('#loading-image').bind('ajaxStart', function () {
        $(this).show();
    }).bind('ajaxStop', function () {
        $(this).hide();
    });
    /* Search page JS Code -- Start (Developer: Rushabh Madhu)*/
    $('#autocomplete').keyup(function (e) {
        e.preventDefault();
        var keyword = $.trim($("#autocomplete").val());
        var autocompleteData = [];
        if (e.keyCode == 13) {
            console.log("Enter pressed");
            $("#search_form").submit();
        }

        if(keyword.length>=3){
        $.ajax({
            data: { keyword: keyword },
            url: '/get_search_autocomplete_data',
            method: 'get',
            success: function (response) {
                if (response.status == 200) {
                    response.suggestions.forEach(function(data){
                        autocompleteData.push(data.title + " - "+ data.type); 
                        // autocompleteData = ['base','cat','abc'];
                        $("#autocomplete").autocomplete({
                            source: autocompleteData
                        });
                    });
                }
            }
        });
        }
    });

    var lis = $('.category_elements li');
    var searchelements = lis;
    $("#category_search").keyup(function () {
        var search_text = $.trim($("#category_search").val());
        if (search_text.length > 0) {
            var regex = new RegExp(this.value, 'i');
            lis.hide().filter(function () {
                return regex.test($.trim($(this).text()))
            }).show();
        } else {
            lis.show();
            $(".hidden_categories").hide();
        }
    });


    var lis2 = $('.location_elements li');
    var searchelements2 = lis2;
    $("#location_search").keyup(function () {
        var search_text = $.trim($("#location_search").val());
        if (search_text.length > 0) {
            var regex = new RegExp(this.value, 'i');
            lis2.hide().filter(function () {
                return regex.test($.trim($(this).text()))
            }).show();
        } else {
            lis2.show();
            $(".hidden_categories").hide();
        }
    });

    $(".uncheck_ratings, .uncheck_location, .uncheck_categories").click(function () {
        $("." + $(this).data('childs')).prop('checked', false);
    });

    /*To Uncheck Clear All checkbox - Start*/
    $(".category_checkboxes").click(function () {
        $(".uncheck_categories").prop('checked', false);
    })

    $(".location_checkboxes").click(function () {
        $(".uncheck_location").prop('checked', false);
    })

    $(".ratings_checkboxes").click(function () {
        $(".uncheck_ratings").prop('checked', false);
    })
    /*To Uncheck Clear All checkbox - END*/

    $(".show_hide").click(function () {
        console.log("click called");
        var action = $(this).data('action');
        var counts = $(this).data('counts');
        var search_element = $(this).data('search_element');
        $("#" + search_element).val('');
        $("#" + search_element).trigger('keyup');
        if (action == 'show_all') {
            $(this).data('action', 'hide_all');
            $(this).html('Show less(5)');//Show All
            $("." + $(this).data('parent') + " .hidden_categories").show();
        } else {
            $(this).html('Show All (' + counts + ')');
            $(this).data('action', 'show_all');
            $("." + $(this).data('parent') + " .hidden_categories").hide();
        }
    });

    /*Dynamic Fetch Search result*/

    $(".apply_button").click(function(e){
        let keyword = $("#autocomplete").val();
        keyword = keyword.toLowerCase();
        keywordToSearch = keyword.split(' - ');
        keywordToSearch.pop();
        keyword = keywordToSearch.join(" ");
        $("#current_page").val(0);
        page = 0;
        let pagination_name = 'filter';
        $("#pagination_name").val(pagination_name);
        keyword = '';
        categories = $('input[type=checkbox].category_checkboxes:checked').map(function () { return $(this).val(); }).get();
        let locations = $('input[type=checkbox].location_checkboxes:checked').map(function () { return $(this).val(); }).get();
        let ratings = $('input[type=checkbox].ratings_checkboxes:checked').map(function () { return $(this).val(); }).get();
        categories = categories.toString();
        locations = locations.toString();
        ratings = ratings.toString();
        console.log("call");
        processDataAndUpdateDom(page, pagination_name, ratings, locations, categories, keyword);
        e.preventDefault();
    });

    $(".search-pagination .page-item").click(function () {
        $("#current_page").val($(this).data('id'));
        page = $("#current_page").val();
        console.log("My Current page:" + page);
    });
    /* Search page JS Code -- End (Developer: Rushabh Madhu)*/

    $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
            $('.dropdown-submenu .show').removeClass("show");
        });
        return false;
    });
    /* MyListing Page JS Code -- Start (Developer: Ruchita Shah)*/

    $(".reset-btn").click(function () {
        //alert("Hi");
        $(".search-field").val('');
        $("#page").val('');
        $("#category-select").val('');
        //$("#search_form").submit();
    });

    $("#category-select").change(function () {
        $("#page").val(0);
    });

    $('.search-content').each(function () {
        var height_e = $(this).height()
        $(this).find('img').height(height_e);
    });  

    function confirmDelete(a) {
        swal({
            title: "Are you sure you want to delete?",
            icon: "warning",
            //text:"Are you sure want to Logout..?",
            buttons: true,
            buttons: ["Cancel", "Confirm"],
            dangerMode: true,
            closeOnClickOutside: false,
            closeOnEsc: false,
            timer: 10000,
        })
            .then((willDelete) => {
                if (willDelete) {
                    window.location.href = "/deleteListing?property=" + a;
                }
            });
    }

    $(document).on('click', '.search-pagination .page-item', function () {
        $("#current_page").val($(this).data('id'));
        console.log("search-pagination .page-item");
        let pagination_name = 'search';
        if($("#pagination_name").val() == 'search'){
            page = $("#current_page").val();
            pagination_name = $("#pagination_name").val();
            var value = $('#autocomplete').val();
            keyword = value.split('-');
            categories = '';
            locations = $("#search_area").val();            
            ratings = '';
        }else{
            page = $("#current_page").val();
            pagination_name = $("#pagination_name").val();
            keyword = $(".search").val();
            categories = $('input[type=checkbox].category_checkboxes:checked').map(function () { return $(this).val(); }).get();
            locations = $('input[type=checkbox].location_checkboxes:checked').map(function () { return $(this).val(); }).get();
            ratings = $('input[type=checkbox].ratings_checkboxes:checked').map(function () { return $(this).val(); }).get();
            categories = categories.toString();
            locations = locations.toString();
            ratings = ratings.toString();
        }

        console.log("Page :"+page);
        console.log("pagination_name : "+pagination_name);
        console.log("ratings"+ratings);
        console.log("locations"+locations);
        console.log("categories"+categories);
        console.log("keyword"+keyword);
        processDataAndUpdateDom(page, pagination_name, ratings, locations, categories, keyword[0]);
        //console.log($(this).data('id') + "Page" + page);
    });

    /* MyListing Page JS Code -- End (Developer: Ruchita Shah)*/
    function processDataAndUpdateDom(page, pagination_name, ratings, locations, categories, keyword) {
        if (typeof keyword == "undefined") {
            keyword = '';
        }
        console.log("Page: " + page);
        console.log("Action Type :"+pagination_name);
        console.log("ratings: " + ratings);
        console.log("locations: " + locations);
        console.log("categories: " + categories);
        console.log("keyword: " + keyword);

        $.ajax({
            data: { page: page, pagination_name:pagination_name, ratings: ratings, locations: locations, categories: categories, keyword: keyword },
            url: '/get_locations_fiters',
            method: 'post',
            success: function (response) {
                if (response.status == 200) {                   
                    var paginationData = '';
                    var isCurrent = '';
                    paginationData += '<li class="page-item" data-id="0"><a class="page-link" href="javascript:void(0)">First</a></li>';
                    response.pagination.forEach(function (pagin) {
                        isCurrent = (pagin == response.activePage) ? 'active' : '';
                        paginationData += '<li class="page-item ' + isCurrent + '" data-id="' + pagin + '"><a class="page-link" href="javascript:void(0)">' + (pagin + 1) + '</a></li>';
                    })
                    if (response.activePage == response.lastPage) {
                        isCurrent = 'active';
                    } else {
                        isCurrent = '';
                    }

                    paginationData += '<li class="page-item ' + isCurrent + '" data-id="' + response.lastPage + '"><a class="page-link" href="javascript:void(0)">Last</a></li>';
                    locationData = '';
                    //console.log(response.properties);
                    response.properties.forEach(function (pagin) {
                        locationData += '<div class="card p-2 mb-2" data-id="' + pagin.id + '"> <div class="row mr-0 ml-0"> <div  class="col-lg-4 col-md-12 col-sm-12 col-xs-12 location-img" style="background-image:url(/images/' + pagin.media_url + ')"> </div> <div class="col-lg-8 col-md-12 col-sm-12 col-xs-12 location-detail"> <div> <h5 class="card-title"> <a href="' + response.base_url + '/location/' + pagin.slug + '/details" data-abc="true" rushabh="yes">' + pagin.property_name + '</a> </h5></div><div><span class="badge badge-info">' + pagin.average_rating + ' ★</span> <span class="text-muted ml-3">' + pagin.review_count + ' reviews</span> </div> <p class="card-text mt-3 mb-1 char-limit"> <span class="sprite align-middle" id="marker"></span>' + pagin.area + ' ' + pagin.country + '</p> <p class="card-text mb-2 char-limit"><span class="sprite align-middle" id="tager"> </span>' + pagin.category_name + '</p> <div class="verified"></div> </div> </div> </div>';
                    });

                    //Pagination Div
                    locationData += '<div class="row mt-4"> <ul class="pagination search-pagination"> </ul> </div>';

                    //Add locations
                    //console.log(response.properties.length);
                    if (response.properties.length == 0) {
                        locationData = '<div class="no_result_found"> Sorry, we could not find any results matching your search criteria. you can add your location from <a href="<%-base_url%>/addListing">here</a></div>';
                    }
                    $("#search #location").html(locationData);
                    //Add counters of N location founds
                    $("#location").prepend("<span class='records_found'>" + response.total_count + "    locations found</span>");
                    if (response.properties.length > 4 || response.activePage > 1) {
                        //Add pagination to page
                        $(".search-pagination").html(paginationData);
                    }
                    if (response.sproperties.length > 4) {
                        featuredLocationStr = '';
                        response.sproperties.forEach(function (flocation) {
                            featuredLocationStr += '<div class="location_box"> <div class="col-lg-4 on-padding"> <div class="location-img" style="background-image: url(/images/' + flocation.media_url + ');"> <div class="text-block bg-info"> <b>' + flocation.average_rating + ' ★</b> </div> </div> </div> <div class="col-lg-8"> <div class="location-detail p-2"> <h6 class="card-title"><a href="' + response.base_url + '/location/' + flocation.slug + '/details" data-abc="true">' + flocation.property_name + '</a></h6><div class="text-muted">' + flocation.area + ' ' + flocation.country + '<div>Lombard Residential Appartments</div></div></div></div></div>';
                        });
                        $(".sponsor_locations").html(featuredLocationStr);
                    } 
                } 
                else {
                    console.log("Invalid Status found in Ajax call.");
                }
            }, error: function (error) {
                console.log("error called");
                console.log(error);
            }
        });
    }
});

