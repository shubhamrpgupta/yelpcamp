if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');  
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const campgroundRoute = require('./routes/campground');
const reviewRoute = require('./routes/review');
const userRoute = require('./routes/user');
const session = require('express-session'); 
const flash = require('connect-flash');
const ExpressError = require('./Utils/ExpressError')  
const ejsMate = require('ejs-mate');  
const methodOverride = require('method-override'); 
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');   
const passport = require('passport');
const localStrategy = require('passport-local');  
const User = require('./models/user');
const MongoStore = require('connect-mongo');


const ourMongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

main().catch(err => console.log(`Mongo ERROR, ${err}`));
async function main() {
    await mongoose.connect(ourMongoDbUrl);
    console.log("MONGO CONNECTION OPEN!!")
}


app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views')) 


const ourSecret = process.env.SECRET || 'notagoodsecret';

const ourMongoStore = MongoStore.create({  
    mongoUrl: ourMongoDbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: ourSecret
    }
});

ourMongoStore.on('error', function (e) {
    console.log('SESSION STORE ERROR!!', e)
});


const sessionConfig = { 
    store: ourMongoStore,
    name: 'sessionName', 
    secret: ourSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  
        // secure:true,   //for the https requests
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(mongoSanitize());  
app.use(session(sessionConfig))  
app.use(flash());
app.use(passport.initialize());  
app.use(passport.session()); 
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 
app.use((req, res, next) => { 
    res.locals.success = req.flash('success');    
    res.locals.update = req.flash('update');  
    res.locals.erase = req.flash('erase');
    res.locals.error = req.flash('error');
    res.locals.signedInUser = req.user;  
    next();
})

app.use(express.urlencoded({ extended: true }));   
app.use(express.json());   
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'staticFiles')))  
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/review', reviewRoute);
app.use('/', userRoute);


app.engine('ejs', ejsMate); 


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
