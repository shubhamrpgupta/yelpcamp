const BaseJoi = require('joi');//this is for the Schema for the data before it reaches to the mongoose.
// We check either the data is in the correct form. we can use 'express-validator' instead of 'Joi'.

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);  //we're changing the normal 'Joi' with the sanitized 'Joi' which will help in vulnerability. 
//now we can use custimized method of 'escapeHtml' in the required positions.

module.exports.campgroundSchema = Joi.object({   //here we are checking if the data is valid,complete and in correct format or not in the campground creation on server side,
    campground: Joi.object({    //to check this we have to define an Schema which is not a mongoose Schema
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})
