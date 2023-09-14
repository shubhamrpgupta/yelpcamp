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
//Remember that middleware functions are executed in the order they are specified in the route. 
//So, in this case, storeReturnTo should be called first, followed by passport.authenticate() and then the final middleware function to redirect the user.
module.exports.logInUserAndGetBackToOriginalUrl = (req, res) => {
    req.flash('success', 'WELCOME BACK!!')
    const redirectUrl = res.locals.returnToUrlBeforeLogIn || '/campgrounds';  //if user has been logged in already then we'll be redirecting the user to the '/campgrounds'
    res.redirect(redirectUrl);  //we're redirecting the user to the page on which he was before getting onto the Login page
};
//By using the storeReturnTo middleware function, we can save the req.session.returnToUrlBeforeLogIn value to res.locals before passport.authenticate() clears the session 
//and deletes 'req.session.returnToUrlBeforeLogIn'. This enables us to access and use the req.session.returnToUrlBeforeLogIn value (via res.locals.returnToUrlBeforeLogIn).
//later in the middleware chain so that we can redirect users to the appropriate page after they have logged in.

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {      //req.logout is method of passport for the logout. 'req.logout' requires call back function as an argument.
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!!'); //and we'll execute the code to set a flash message and  redirect the user in the 'req.logout' argurment
        res.redirect('/campgrounds');
    });
};