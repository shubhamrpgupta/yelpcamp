const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync') 
const { isLoggedIn, isOwnerValid, validateCampground } = require('../middleware'); 
const campController = require('../controllers/campsControls');
const multer = require('multer');  
const { cloudStorage } = require('../cloudinary');  
const upload = multer({
    storage: cloudStorage 
}); 
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
