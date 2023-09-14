const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);
//you to have to plugin the passport local mongoose to get the username and password in the hashed and salted form.
// these data get pushed automatically in the new User model.

const User = mongoose.model('User', userSchema);

module.exports = User;