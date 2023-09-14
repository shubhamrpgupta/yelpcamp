const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/userControls')


// app.get('/registerfakeuser', async (req, res) => {   //this is an example
//     const newUser = new User({ email: 'xyz@gmail.com', username: 'zyx' });
//     const registerNewUser = await User.register(newUser, 'anypassword');
//     res.send(registerNewUser);
// })

router.get('/register', userController.renderRegisterNewUser);
router.post('/register', catchAsync(userController.registerNewUserAndLoggedIn));
router.get('/login', userController.renderLogInUser);
const passportMiddlewareToLogin = passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' });
//we are giving the passportMiddlewareToLogin for the authentication of the password. for the authentication we are using passport.
//in the 'passport.authenticate', 'local' is the strategy. 'failureFlash & failureRedirect' are the options.
router.post('/login', storeReturnTo, passportMiddlewareToLogin, userController.logInUserAndGetBackToOriginalUrl);
router.get('/logout', userController.logoutUser);

module.exports = router;