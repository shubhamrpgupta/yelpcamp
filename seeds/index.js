const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');


main().catch(err => console.log(`Mongo ERROR, ${err}`));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log("MONGO CONNECTION OPEN!!")
}

//this is to get the random name in the seedDB:
const sample = array => (array[Math.floor(Math.random() * array.length)])


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000) + 1;
        const price = Math.floor(Math.random() * 1000) + 1;
        const camp = new Campground({
            owner: '64f03b3cad7731ad6ce08eb0',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            price,
            geometry: {
                "type": "Point", "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dm9wmpv7t/image/upload/v1693663541/YelpCamp/bvk8ebsgut5bvx3iloyl.jpg',
                    filename: 'YelpCamp/bvk8ebsgut5bvx3iloyl'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. In, minus quam dolor temporibus cupiditate magnam quod sed et delectus, aliquid sint ratione debitis at. Illo expedita eos blanditiis tempora doloribus.'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})