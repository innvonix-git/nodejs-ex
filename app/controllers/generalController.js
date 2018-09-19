let numeral 	= require('numeral');
let bcrypt 		= require('bcrypt-nodejs');
let dateFormat  = require('dateformat');
let fs          = require('fs');
let moment      = require('moment');
let models      = require('../../app/models/revstance_models');
let User 		= models.User;
let Property 	= models.Property;
let Review 		= models.Review;
let Category    = models.Category;
let FlaggedReview= models.Flag;
let ReportFlag   = models.ReportFlag;
let Like   	     = models.Like;
let Membership   = models.Membership;
var random          = require('mongoose-random');
let constants       = require('../../config/constants'); 
let tokenallocate   = require('../../app/controllers/tokenController');

exports.getAutoCompleteData = async function(req, res){
    let keyword = '';
    let categories;
    let properties;
    let areas;
    let suggestions = [];
    if(req.query.keyword)
    {
        keyword=req.query.keyword.trim().toLowerCase();
    }

    if (typeof req.query.keyword !== 'undefined' && req.query.keyword) {
        console.log("Search keyword="+keyword);
        categories = await Category.find({ category_name: { "$regex": keyword, "$options": "i" }} , {status:1}).select('id category_name');
        // console.log(categories);
        properties = await Property.find({ property_name: { "$regex": keyword, "$options": "i" } }, {status:1}).select('id property_name');
        
        areas = await Property.find({ area: { "$regex": keyword, "$options": "i" } }, { status: 1 }).select('id area');
        
        categories.forEach(function(category){
            suggestions.push({ 'type': 'Category', 'title': category.category_name,'id':category.id});
        });
        
        properties.forEach(function (property) {
            suggestions.push({ 'type': 'Property', 'title': property.property_name, 'id': property.id });
        });

        areas.forEach(function (property) {
            suggestions.push({ 'type': 'Area', 'title': property.area, 'id': property.id });
        });
        var returnObj = {};
        returnObj.suggestions = suggestions;
        returnObj.status = 200;
        res.send(returnObj);
    }else{
        returnObj.status = 400;
        res.send(returnObj);
    }
}

exports.getLocationsByFilters = async function(req, res){
    let page = 0;
    let keyword = '';
    let categories = [];
    let locations = [];
    let ratings = [];
    let categoryList = [];
    let categoryToSearch = [];
    let ratingsList = [];
    let ratingsToSearch = [];
    let locationsList = [];
    let locationsToSearch = [];
    let actionType = 'filter';
    let perPage = 5;
    let area = '';
    let categoriesToSearch = [];
    console.log(req.body);
    
    if(req.body.keyword){
        keyword = req.body.keyword.trim();
    }

    if(req.body.categories){
        categoryList = req.body.categories.split(',');
        categoryList.forEach(function(element){
            if(element.length>0){
                categoryToSearch.push(parseInt(element));
            }
        })
    }else{
        if (categoryToSearch.length==0){
            let allCategories = await Category.find();
            console.log(allCategories.length);
            allCategories.forEach(function(cates){
                categoryToSearch.push(parseInt(cates.id));
            })
        }
    }
    if (req.body.ratings) {
        ratingsList = req.body.ratings.split(',');
        ratingsList.forEach(function (element) {
            if (element.length > 0) {
                ratingsToSearch.push(parseInt(element));
            }
        })        
    }else{
        if(ratingsToSearch.length==0){
            for(i=0;i<=5;i++){
                ratingsToSearch.push(parseInt(i));
            }
            ratingsToSearch.push('');
        }
    }
    if (req.body.locations) {
        locationsList = req.body.locations.split(',');
        locationsList.forEach(function (element) {
            if (element.length > 0) {
                locationsToSearch.push(element);
            }
        })
        //console.log(locationsToSearch);
    }

    if(locationsToSearch.length==0){
        let properties = await Property.find({ status: 1 }).distinct('area');
        properties.forEach(function (property) {
            let area = property.trim();
            if (area.length > 0) {
                locationsToSearch.push(area);
            }
        });
    }

    if(req.body.page){
        page=parseInt(req.body.page);
    }
    sproperties = await Property.find({ status: 1, is_featured: 1 }).sort({ 'id': 1 }).limit(5);
    let fields = ['id', 'property_name', 'area', 'country', 'address1', 'address2', 'post_code', 'category', 'user_id', 'average_rating'];
    let searchId = getRandomInt(10);
    //console.log("search column" + fields[searchId]);
    switch (searchId) {
        case 1:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'id': 1 }).limit(5);
            break;
        case 2:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'property_name': 1 }).limit(5);
            break;
        case 3:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'area': 1 }).limit(5);
            break;
        case 4:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'country': 1 }).limit(5);
            break;
        case 5:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'address1': 1 }).limit(5);
            break;
        case 6:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'address2': 1 }).limit(5);
            break;
        case 7:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'post_code': 1 }).limit(5);
            break;
        case 8:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'category': 1 }).limit(5);
            break;
        case 9:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'user_id': 1 }).limit(5);
            break;
        case 10:
            sproperties = await Property.find({ status: 1, is_featured: 1 }).populate('category').select('id property_name slug average_rating area is_featured address1 address2 property_images post_code status reviews country').sort({ 'average_rating': 1 }).limit(5);
            break;
    }
    var returnObject = {};
    //console.log("Featured locations");
    //console.log(sproperties);
    let featuredListing = [];
    sproperties.forEach(function(featured){
        categoryName = '';
        propertyObj = {};
        featured.category.forEach(function (cate_name) {
            categoryName += ' ' + cate_name.category_name;
        });
        propertyObj.id = featured.id;        
        propertyObj.property_name = featured.property_name;
        propertyObj.address1 = featured.address1;
        propertyObj.address2 = featured.address2;
        propertyObj.post_code = featured.post_code;
        propertyObj.area = featured.area;
        propertyObj.country = featured.country;
        propertyObj.average_rating = featured.average_rating;
        propertyObj.category_name = categoryName;
        media_url = featured.property_images.split(",");
        propertyObj.media_url = media_url[0];
        if (typeof featured.reviews.length !== 'undefined' && featured.reviews.length) {
            propertyObj.review_count = featured.reviews.length;
        } else {
            propertyObj.review_count = 0;
        }

        if (typeof propertyObj.review_count !== 'undefined' && propertyObj.review_count) {
            propertyObj.review_count = 0;
        }

        featuredListing.push(propertyObj);
    });
    returnObject.sproperties = featuredListing;

    if(actionType=='search'){
        console.log("if");
        //console.log(perPage);
        //console.log(page);
        categories = await Category.find({ category_name: { "$regex": keyword, "$options": "i" } }, {status:1});
        console.log("Category length:" + categories.length);
        categories.forEach(function (category) {
            categoriesToSearch.push(parseInt(category.id));
        });
        console.log(categoriesToSearch);
        propertiesCount = await Property.countDocuments({ $and: [{ $or: [{ property_name: { "$regex": keyword, "$options": "i" } }, { category_id: { $in: categoriesToSearch } }, { area: { "$regex": keyword, "$options": "i" } }]},{ status: 1 }]});
        console.log(propertiesCount);
        properties = await Property.find({ $and: [{ $or:[{property_name: { "$regex": keyword, "$options": "i" } },{ category_id: { $in: categoriesToSearch } }, { area: { "$regex": keyword, "$options": "i" } }]},{ status: 1 }]}).select('id property_name property_images average_rating slug area country is_featured address1 address2 post_code status reviews').populate('category').limit(perPage).skip(perPage * page).exec();
        //console.log("property length: "+properties.length);
        //console.log(properties);
       
        let pagination = [];
        var lastPage = Math.ceil(propertiesCount / perPage);
        returnObject.activePage = page;        
        lastPage = lastPage - 1;

        for (k = 0; k < lastPage; k++) {
            if (((k + 3) == page) || ((k + 2) == page) || ((k + 1) == page) || (k == page) || ((k - 1) == page) || ((k - 2) == page) || ((k - 3) == page)) {
                pagination.push(k);  
            }
        }

        //console.log(properties);
        let allProperties = [];
        let propertyObj = {};
        properties.forEach(function(prop){
            //console.log(prop.id);
            categoryName = '';
            propertyObj = {};
            prop.category.forEach(function(cate_name){
                categoryName += ' '+cate_name.category_name;
            });
            propertyObj.id = prop.id;
            //console.log(propertyObj.id);
            propertyObj.property_name = prop.property_name;
            propertyObj.address1 = prop.address1;
            propertyObj.address2 = prop.address2;
            propertyObj.post_code = prop.post_code;
            propertyObj.area = prop.area;
            propertyObj.country = prop.country;
            propertyObj.is_featured = prop.is_featured;
            propertyObj.status = prop.status;            
            propertyObj.slug = prop.slug;
            propertyObj.category_name = categoryName;            
            media_url = prop.property_images.split(",");
            propertyObj.media_url = media_url[0];
            //console.log(prop.reviews + " : " + prop.id);
            
            if (typeof prop.reviews !== 'undefined'){
                propertyObj.review_count = prop.reviews.length;
            } else{
                propertyObj.review_count = 0;
            }

            if (typeof prop.average_rating !== 'undefined' && prop.average_rating) {
                propertyObj.average_rating = prop.average_rating;
            }else{
                propertyObj.average_rating = 0;
            }
            allProperties.push(propertyObj);            
        })
        returnObject.properties = allProperties;        
        returnObject.pagination = pagination;
        returnObject.lastPage = lastPage;
        returnObject.total_count = propertiesCount;
        returnObject.status = 200;
        returnObject.base_url = req.app.locals.base_url;
        res.send(returnObject);    
    }else{
        console.log("else");
        console.log("ratingsToSearch");
        console.log(ratingsToSearch);
        console.log("categoryToSearch");
        console.log(categoryToSearch);
        console.log("locationsToSearch");
        console.log(locationsToSearch);
        propertiesCount = await Property.countDocuments({ $and: [{ average_rating: { $in: ratingsToSearch } }, { category_id: { $in: categoryToSearch } }, { property_name: { "$regex": keyword, "$options": "i" } }, { area: { $in: locationsToSearch }}, { status: 1 }] });
        properties = await Property.find({ $and: [{ average_rating: { $in: ratingsToSearch } }, { category_id: { $in: categoryToSearch } }, { area: { $in: locationsToSearch } }, { property_name: { "$regex": keyword, "$options": "i" } }, { status: 1 }] }).select('id property_name property_images average_rating slug area country is_featured address1 address2 post_code status reviews').populate('category').limit(perPage).skip(perPage * page).exec();

       
        let pagination = [];
        var lastPage = Math.ceil(propertiesCount / perPage);
        returnObject.activePage = page;        
        lastPage = lastPage - 1;

        for (k = 0; k < lastPage; k++) {
            if (((k + 3) == page) || ((k + 2) == page) || ((k + 1) == page) || (k == page) || ((k - 1) == page) || ((k - 2) == page) || ((k - 3) == page)) {
                pagination.push(k);  
            }
        }

        //console.log(properties);
        let allProperties = [];
        let propertyObj = {};
        properties.forEach(function(prop){
            categoryName = '';
            propertyObj = {};
            prop.category.forEach(function(cate_name){
                categoryName += ' '+cate_name.category_name;
            });
            propertyObj.id = prop.id;
            //console.log(propertyObj.id);
            propertyObj.property_name = prop.property_name;
            propertyObj.address1 = prop.address1;
            propertyObj.address2 = prop.address2;
            propertyObj.post_code = prop.post_code;
            propertyObj.area = prop.area;
            propertyObj.country = prop.country;
            propertyObj.is_featured = prop.is_featured;
            propertyObj.status = prop.status;            
            propertyObj.slug = prop.slug;
            propertyObj.category_name = categoryName;            
            media_url = prop.property_images.split(",");
            propertyObj.media_url = media_url[0];
            //console.log(prop.reviews + " : " + prop.id);
            
            if (typeof prop.reviews !== 'undefined'){
                propertyObj.review_count = prop.reviews.length;
            } else{
                propertyObj.review_count = 0;
            }

            if (typeof prop.average_rating !== 'undefined' && prop.average_rating) {
                propertyObj.average_rating = prop.average_rating;
            }else{
                propertyObj.average_rating = 0;
            }

            allProperties.push(propertyObj);            
        })
        returnObject.properties = allProperties;        
        returnObject.pagination = pagination;
        returnObject.lastPage = lastPage;
        returnObject.total_count = propertiesCount;
        returnObject.status = 200;
        returnObject.base_url = req.app.locals.base_url;
        //console.log(returnObject);
        res.send(returnObject);
    }
}

exports.updateSlug = async function (req, res) {
    let properties = await Property.find({"slug": { "$exists": false }}).limit(100);
    let list = [];
    properties.forEach(async function(property){
        let objectData = {};
        objectData.slug = generateSlug(property.id, property.property_name);
        pr = await Property.findOneAndUpdate({ _id: property._id}, objectData , { new: true });
        list.push(pr);        
    });
    res.send(list);
}

function generateSlug(id, propertyName) {
    let newslug = propertyName.replace(" ","-");
    newslug = newslug.toLowerCase();
    newslug = newslug+"_"+id;
    return newslug;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
