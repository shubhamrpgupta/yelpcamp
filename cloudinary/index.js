//we're making a new storage in cloudinary with the help of sensitive data (cloudinary's api,secret) with both the packages 
// one package is configuring the path where to upload the data and second package is useful to make a new storage in cloudinary


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret
});

const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowed_formats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary, cloudStorage
}