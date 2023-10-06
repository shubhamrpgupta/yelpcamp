const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas'); 
const ExpressError = require('./Utils/ExpressError'); 


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnToUrlBeforeLogIn = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    } else
        next();
}


module.exports.isOwnerValid = async (req, res, next) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id);
    if (!foundCamp.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


module.exports.isReviewOwnerValid = async (req, res, next) => {
    const { id, reviewId } = req.params
    const foundReview = await Review.findById(reviewId);
    if (!foundReview.reviewOwner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


module.exports.validateCampground = (req, res, next) => {   
    const { error } = campgroundSchema.validate(req.body);   
    if (error) {   
        const msg = error.details.map(el => el.message).join(',')   
        throw new ExpressError(msg, 400)   
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);  
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next();
}


module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnToUrlBeforeLogIn) {
        res.locals.returnToUrlBeforeLogIn = req.session.returnToUrlBeforeLogIn;
    }
    next();
}
