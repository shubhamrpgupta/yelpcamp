const express = require('express');
const router = express.Router({ mergeParams: true });  //mergeparams because express router keep params separately for the routes.
const catchAsync = require('../Utils/catchAsync')  
const { isLoggedIn, validateReview, isReviewOwnerValid } = require('../middleware'); 
const reviewController = require('../controllers/reviewControls');


router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.postReview));
router.delete('/:reviewId', isLoggedIn, isReviewOwnerValid, catchAsync(reviewController.deleteReview));


module.exports = router;
