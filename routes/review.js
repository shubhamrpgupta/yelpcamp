const express = require('express');
const router = express.Router({ mergeParams: true });  //mergeparams because express router keep params separately for the routes.
const catchAsync = require('../Utils/catchAsync')   //this is to handle the async errors.
const { isLoggedIn, validateReview, isReviewOwnerValid } = require('../middleware');  //we're checking if the user is logged in or not
const reviewController = require('../controllers/reviewControls');


router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.postReview));
router.delete('/:reviewId', isLoggedIn, isReviewOwnerValid, catchAsync(reviewController.deleteReview));


module.exports = router;