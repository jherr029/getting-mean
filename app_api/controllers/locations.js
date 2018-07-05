var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};


var theEarth = (function() {
    var earthRadius = 3959;

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
    };
})  ();

module.exports.locationsCreate = function (req, res) { 
    Loc.create({
        name: req.body.name,
        addres: req.body.address,
        facilities: (req.body.facilities  || "").split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.opening2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]

    }, function(err, location) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    });
};

module.exports.locationsListByDistance = function (req, res) { 
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var point = {
        type: "Point",
        coordinate: [lng, lat]
    };

    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(20),
    };

    if (!lng || !lat) {
        sendJsonResponse(res, 404, {
            "message": "lng and lat query parameters are required"
        });
        return;
    }

    Loc.aggregate(
        [
            {
                $geoNear: {
                    near: { type: "Point", coordinates : [10, 10]},
                    distanceField: 'dist',
                    maxDistance: 10000,
                    spherical: true
                }
            }
        ]).then(function(err, results, next){
            res.send();
        })
};


var buildLocationList = function(req, res, results, stats) {
    var locations = [];

    results.forEach(function(doc) {
        locations.push({
            distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id

        });
    });

    return locations;
}

module.exports.locationsReadOne = function (req, res) { 
    if (req.params && req.params.locationid) {
        Loc
            .findById(req.params.locationid)
            .exec(function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;

                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }

                sendJsonResponse(res, 200, location)
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid in request"
        });
    }
};

module.exports.locationsUpdateOne = function (req, res) { 
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
        return
    }
    Loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(
            function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {
                        "message": "locationid not found"
                    });
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                
                location.name = req.body.name;
                location.address = req.body.address;
                location.facilities = (req.body.facilities || '').split(",");
                location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1,
                }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2,
                }];
                
                location.save(function(err, location) {
                    var thisReview;
                    if (err) {
                        console.log(err);
                        sendJsonResponse(res, 400, err);
                    } else {
                        updateAverageRating(location._id);
                        thisReview = location.reviews[location.reviews.length - 1];
                        sendJsonResponse(res, 201, location);
                    }
                });
            }
        );
};

module.exports.locationsDeleteOne = function (req, res) { 
    var locationid = req.params.locationid;

    if (locationid) {
        Loc
            .findByIdAndRemove(locationid)
            .exec(
                function(err, location) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    sendJsonResponse(res, 204, null);
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid"
        });
    }
};

/*
module.exports.locationsListByDistance = function (req, res) { 
    sendJsonResponse(res, 200, {"status" : "success"});
};
*/