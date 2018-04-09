/* GET 'home' page */
module.exports.homelist = function(req, res){
    res.render('locations-list', { 
        title: 'Loc8r - find a place to work with wifill',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near youa!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when you are out and about.",
        locations: [{
            name: 'Starcups',
            address: '125 high street, reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'food', 'premium wifi'],
            distance: '100mm'
        }, {
            name: 'Cafe Hero',
            address: '321 Make Believe Street, Imagination',
            rating: 4,
            facilities: ['Hot drinks', 'Cold drinks', 'Premium wifi'],
            distance: '200m'
        }, {
            name: 'Burger Queen',
            address: '312 Make Believe Street, Imagination',
            rating: 2,
            facilities: ['Food', 'Premium wifi'],
            distance: '210m'
        }]
    });
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res){
    res.render('location-info', { title: 'Location Info' });
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res){
    res.render('location-review-form', { title: 'Add Review' });
};