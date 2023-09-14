const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync')   //this is to handle the async errors.
const { isLoggedIn, isOwnerValid, validateCampground } = require('../middleware');  //we're checking if the user is logged in or not
const campController = require('../controllers/campsControls');
const multer = require('multer');  //this is to upload the image on localStorage/(aws or cloudinary)
const { cloudStorage } = require('../cloudinary');  //because we have made a new storage in cloudinary.
const upload = multer({
    storage: cloudStorage // dest:'uploads/'
});  //giving the req's data to store at that particular location(aws/cloudinary or localStorage)
router.route('/')
    .get(catchAsync(campController.allCampgrounds))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campController.newCampground));

router.get('/new', isLoggedIn, campController.renderNewCamp);
router.get('/:id/edit', isLoggedIn, isOwnerValid, catchAsync(campController.renderEditForm));

router.route('/:id')
    .put(isLoggedIn, isOwnerValid, upload.array('image'), validateCampground, catchAsync(campController.updateCampground))
    .get(catchAsync(campController.showCampground))
    .delete(isLoggedIn, isOwnerValid, catchAsync(campController.deleteCampground));


module.exports = router;