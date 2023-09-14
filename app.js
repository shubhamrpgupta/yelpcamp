if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');   //With the help of EJS, we create and use different or multiple views. 
// In views, Either we could have EJS files(URLs) or we can use this in JSON as well
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const campgroundRoute = require('./routes/campground');
const reviewRoute = require('./routes/review');
const userRoute = require('./routes/user');
const session = require('express-session');  // to use the session for the flash and authentication.
const flash = require('connect-flash');  //to flash any required message
const ExpressError = require('./Utils/ExpressError')  //this is to customised error handler
const ejsMate = require('ejs-mate');  //we install this to use a common EJS(Boilerplate)'s layout option to all the views ejs
const methodOverride = require('method-override');   //We install this for the EDIT or UPDATE, 
//because we have to override the method [from (GET/POST) to (PATCH/PUT/ETC)] in <a> in the ejs file
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');   //this is to ensure there is no sequential injection error taking pLce, 
//security of 'req.body,req.querry,req.params etc' in the mongoose database.
const passport = require('passport'); // to authenticate & hash, salt and store the username and password for any user.
const localStrategy = require('passport-local');  //we are using the strategy know as 'Local', we can choose the different strategy from the passport website.
const User = require('./models/user');
const MongoStore = require('connect-mongo'); //storage for the sessions's data in mongo. the default storage for sessions is localDatabse.
//but to deploy the app, we use the mongo foe the sessions.


const ourMongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
// process.env.MONGO_DB_URL

main().catch(err => console.log(`Mongo ERROR, ${err}`));
async function main() {
    await mongoose.connect(ourMongoDbUrl);
    console.log("MONGO CONNECTION OPEN!!")
}


app.set('view engine', 'ejs');   // we put this to initiate EJS property 
app.set('views', path.join(__dirname, 'views'))  // this is to launch the site or app successfuly within any directory


const ourSecret = process.env.SECRET || 'notagoodsecret';

const ourMongoStore = MongoStore.create({  //creating a new MongoStore for the sessions to be used.
    mongoUrl: ourMongoDbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: ourSecret
    }
});

ourMongoStore.on('error', function (e) {
    console.log('SESSION STORE ERROR!!', e)
});


const sessionConfig = {  //for the argument of session app.use
    store: ourMongoStore,
    name: 'sessionName',  //'connect.sid' is the default name.
    secret: ourSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  //for the security reasons we give true which is default.
        // secure:true,   //for the https
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(mongoSanitize());  //to secure our mongoose databse throught the 'req.body, req.params, req.querry and etc' and we've to use this before.
app.use(session(sessionConfig)) //for the sessions 
app.use(flash());
app.use(passport.initialize()); //this middleware is require to start the passport. 
app.use(passport.session());  //this command should be come after the app.use(session());
//because we are going to have persistent login sessions or want use all the secret routes and won't need to login again and again for the same user.
passport.use(new localStrategy(User.authenticate()));
// here we are saying passport to use strategy Local and authentication method is 'authenticate' which is located in our model 'user'
// 'authenticate' static method has been added in our 'user' model with the help of 'passportLocalMongoose' and got plugin
passport.serializeUser(User.serializeUser()); //again this is coming from the passportLocalMongoose.
// serializeUser is how we store the user's data(it could be either _id or etc) into the session which be helpful for the login Once only.
passport.deserializeUser(User.deserializeUser()); //this is to destroy the saved session. or for the logout.
app.use((req, res, next) => {  //an express middleware for the flash.  we used app.use for all the sites.
    res.locals.success = req.flash('success');     //In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle. 
    res.locals.update = req.flash('update');  //It allows you to store variables that can be accessed by your templates and other middleware functions.
    res.locals.erase = req.flash('erase'); //this 'locals' gives access the data in the global templates.
    res.locals.error = req.flash('error');
    res.locals.signedInUser = req.user;   //we're using this info in navbar file.
    //with the help of passport we are getting the user's data who is signed in from the 'req.user'
    //and we are saving the user's data in every page. we're saving it in locals.signedInUser
    //now we'll have the user's data and we can show that in the navbar's ejs. and in every template. because it's in global app template.
    next();
})
//the passport.serializeUser()  and passport.deserializeUser()  actions need to occur before trying to access req.user, as the user info is not introduced into the request until then.
//Also, the middleware for the locals, needs to be defined above the routes(routes folder) in order for the routes (and by extension, the EJS templates) to have access to res.locals.

app.use(express.urlencoded({ extended: true }));   // To  use the request data in URL format from the POST type request. or to parse the data into POST
app.use(express.json());   // To  use the request data in JSON format from the POST type request
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'staticFiles')))  //static is use for the files which will not change or for the public files
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/review', reviewRoute);
app.use('/', userRoute);


app.engine('ejs', ejsMate);  // to use Boilerplate EJS as a structure for all the views EJS


app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/shubham/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




app.get('/', (req, res) => {
    res.render('home')
})
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { message = 'You got an error, Something went Wrong!!' }
    res.status(statusCode).render('error', { err })
})



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
