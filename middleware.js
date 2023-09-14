//to use this middleware for multiple routes or for multiple models, we are storing the middleware in the separate file.
//we cannot put this middleware in the app.js because we have to trim the app.js
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas'); //for the validateCampground and validateReview
const ExpressError = require('./Utils/ExpressError'); //this is to customised error handler


//if user wants to add a new campground or edit or etc they should have logged in first
// 'req.isAuthenticated' is the passport's method to check the authenticity of user.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnToUrlBeforeLogIn = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    } else
        next();
}

//if the owner is valid to edit or delete the campground with all the data in it. otherwise we'll hide the buttons.
module.exports.isOwnerValid = async (req, res, next) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id);
    if (!foundCamp.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//if the review's Owner is valid to delete the review.
module.exports.isReviewOwnerValid = async (req, res, next) => {
    const { id, reviewId } = req.params
    const foundReview = await Review.findById(reviewId);
    if (!foundReview.reviewOwner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//if the new or updated campground is in the required format from all the end.
module.exports.validateCampground = (req, res, next) => {   //check the schemas.js file
    const { error } = campgroundSchema.validate(req.body);    //to get any error during the data input for the new campground,
    if (error) {    //we are showing the error on the server site,
        const msg = error.details.map(el => el.message).join(',')   //to show the error, We are using this format because,
        throw new ExpressError(msg, 400)   // the result which we are getting from the campgroundSchema.validate(req.body) is an ARRAY
        // so we took error from the RESULT ARRAY and map that because that is an array and it could be more than one. for that we have to join all the messages.
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);  //we are using mongoose middleware which is 'validate'
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next();
}

//'storeReturnTo' to transfer the returnToUrlBeforeLogIn value from the session (req.session.returnToUrlBeforeLogIn)
//to the Express.js app res.locals object before the passport.authenticate() function is executed in the /login POST route.
//In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle.
// It allows you to store variables that can be accessed by your templates and other middleware functions.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnToUrlBeforeLogIn) {
        res.locals.returnToUrlBeforeLogIn = req.session.returnToUrlBeforeLogIn;
    }
    next();
}
