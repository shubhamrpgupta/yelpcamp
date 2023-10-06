const User = require('../models/user');


module.exports.renderRegisterNewUser = (req, res) => {
    res.render('users/register');
};
module.exports.registerNewUserAndLoggedIn = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username: username, email: email });
        const newRegisteredUser = await User.register(newUser, password);   //it's a method of passport for registrating any new user.
        req.login(newRegisteredUser, (err) => {   //'login' & 'logout' are passport's methods which require callback as argument.
            if (err) {
                return next(err)
            }
            req.flash('success', 'Registered A New User!!') //In 'login' & 'logout' methods we give flash message and 'response' in the 'login' or 'logout' method's argument.
            res.redirect('/campgrounds')
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
};

module.exports.renderLogInUser = (req, res) => {
    res.render('users/login');
}
// In the POST /login route (in the routes/users.js file), call the storeReturnTo middleware function before passport.authenticate() or passportMiddlewareToLogin.
module.exports.logInUserAndGetBackToOriginalUrl = (req, res) => {
    req.flash('success', 'WELCOME BACK!!')
    const redirectUrl = res.locals.returnToUrlBeforeLogIn || '/campgrounds';  //if user has been logged in already then we'll be redirecting the user to the '/campgrounds'
    res.redirect(redirectUrl);  //we're redirecting the user to the page on which he was before getting onto the Login page with the help of sessions in middleware.js
};


module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {    
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!!'); 
        res.redirect('/campgrounds');
    });
};
