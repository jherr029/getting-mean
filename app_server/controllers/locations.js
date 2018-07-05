var request = require('request')

var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://guarded-lowlands-88328.herokuapp.com/";
    //apiOptions.server = "http://localhost:3000";
}


var renderHomepage = function(req, res, responseBody){
    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader : {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },

        sidebar: 'Looking for wifi and a seat? Loc8r helps you find places!',
        locations: responseBody,
        message: message
    });
};

var _isNumeric = function (n) {
    return !isNan(parseFloat(n)) && isFinite(n);
}

var _formatDistance = function (distance) {
    var numDistance, unit;

    if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'mi';
    } else {
        numDistance = parseInt(distance * 1000, 10); // maybe fix
        unit = 'm';
    }
    return numDistance + unit;
};

/* GET 'home' page */
module.exports.homelist = function(req, res){
    renderHomepage(req. res);
};


var renderDetailPage = function (req, res, locDetail) {
    res.render('location-info', {
        title: locDetail.name,
        pageHeader: {title: locDetail.name},
        sidebar: {
            context: 'is on Loc8r because it is cool'
        },

        location: locDetail
    });
};

var getLocationInfo = function (req, res, callback) {
    var requestOptions, path;

    path = "api/locations/" + req.params.locationid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : []
    };

    request(
        requestOptions,
        function(err, response, body) {
            var data = body;
            if (response.statusCode === 200) {
                data.coords = {
                    lng : body.coords[0],
                    lat : body.coords[1]
                };
                callback(req, res, data);
            } else {
                _showError(req, res, response.statusCode)
            }
        }
    );
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};

var renderReviewForm = function (req, res) {
    res.render('location-review-form', {
        title: 'Review ' + locDetail.name + ' on Loc8r',
        pageHeadere: { title: 'Review ' + locDetail.name },
        error: req.query.err
        url: req.originalUrl
    });
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData){
        renderReviewForm(req, res);
    });
};

module.exports.doAddReview = function(req, res){
    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    path = "/api/locations/" + locationid + '/reviews';
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };

    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };

    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationid + '/reviews/new?err=val');
    } else {
        request(
            requestOptions,
            function(err, response, body) {
                if (response.statusCode === 201) {
                    res.redirect('/location/' + locationid);
                } else if (response.statusCode === 400 && body.name && body.name === "ValidationError") {
                    res.redirect('/location/' + locaionid + '/reviews/new?err=val');
                } else {
                    console.log(body);
                    _showError(req, res, response.statusCode);
                }
                
            }
        );
    };
};


var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oops";
    } else {
        title = status + ", something's gone wrong";
        content = "Oops";
    }

    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};