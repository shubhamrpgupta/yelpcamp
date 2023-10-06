const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/userControls')




router.get('/register', userController.renderRegisterNewUser);
router.post('/register', catchAsync(userController.registerNewUserAndLoggedIn));
router.get('/login', userController.renderLogInUser);

const passportMiddlewareToLogin = passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' });

router.post('/login', storeReturnTo, passportMiddlewareToLogin, userController.logInUserAndGetBackToOriginalUrl);
router.get('/logout', userController.logoutUser);

module.exports = router;
