const Campground = require('../models/campground')
const Review = require('../models/review');


module.exports.postReview = async (req, res) => {
    const reviewCamp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    reviewCamp.review.push(newReview);
    newReview.reviewOwner = req.user._id;
    await reviewCamp.save();
    await newReview.save();
    req.flash('success', 'Created New Review')
    res.redirect(`/campgrounds/${reviewCamp._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    req.flash('erase', 'Deleted the review')
    res.redirect(`/campgrounds/${id}`)
}
