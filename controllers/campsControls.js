const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');   //In case of edit a campground, to delete the uploaded images from the cloudinary.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //for the geometry of the location
const mapBoxToken = process.env.MAPBOX_TOKEN;  //token from the mapbox.com to use the website
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })  //giving the mapbox of express the token of mapbox.com to use the api from mapbox.com


module.exports.allCampgrounds = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewCamp = (req, res) => {
    res.render('campgrounds/new')
};
module.exports.newCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // if (!req.body.campground) { throw new ExpressError(); }   // here we are checking if there are any missing data which is required.
    const newCamp = new Campground(req.body.campground);    //here we used req.body.campground because in the POST REQUEST FORM in NEW.ejs
    //where we give the information regarding the new campground, we have NAME in the input type. 
    // In the NAME, we gave data in ARRAY format ie camground[title / location]
    newCamp.geometry = geoData.body.features[0].geometry; //with mapbox the data from 'geoData.body.features[0].geometry' is in the format
    //which we have given in the campground model, in the geometry option for new campground.
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //with the multer, we are getting 'req.file' in which uploaded file's data are there from the cloudinary.
    //and we are puting the req.files data in 'newCamp.images'
    newCamp.owner = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully Made A New Campground');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id);
    if (!foundCamp) {
        req.flash('error', 'Campground Not Found');
        res.redirect(`/campgrounds`)
    }
    res.render('campgrounds/edit', { foundCamp })
};
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const updateCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    updateCamp.images.push(...imgs);
    updateCamp.save();
    if (req.body.deleteImages) {
        for (let filenameOfDeleteImage of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filenameOfDeleteImage);  //deleting the image with the filename from the cloudinary
        }
        await updateCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })  //deleting the uploaded image from the server site or from mongoose.
    }
    req.flash('update', 'Updated Your Campground Info')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.showCampground = async (req, res) => {
    const showCamp = await Campground.findById(req.params.id).populate('owner').populate({ path: 'review', populate: { path: 'reviewOwner' } })  //populating the review and and the reviewOwner which comes in Review Model but not in campground Model.
    if (!showCamp) {
        req.flash('error', 'Campground Not Found');
        res.redirect(`/campgrounds`)
    }
    res.render('campgrounds/show', { showCamp })
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('erase', 'Deleted the Campground')
    res.redirect('/campgrounds')
};