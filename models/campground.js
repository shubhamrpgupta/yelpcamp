const mongoose = require('mongoose');
const Review = require('./review');
const { string } = require('joi');


const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumb').get(function () {
    return this.url.replace('/upload', '/upload/w_200/')
});
const opts = { toJSON: { virtuals: true } };  //this is because of the index mapbox popup only. not necessity for the model.


const CampgroundSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    review: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {  //this is because of index mapbox popup only.
    return `<a href="/campgrounds/${this._id}"> ${this.title}</a>
            <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function (camp) {   //this is a mongoose middleware
    if (camp.review.length) {
        await Review.deleteMany({ _id: { $in: camp.review } })
    }
})

const Campground = mongoose.model("Campground", CampgroundSchema)
module.exports = Campground;