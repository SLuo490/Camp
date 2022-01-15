const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Add a username and password field to User Schema behind the scene
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
