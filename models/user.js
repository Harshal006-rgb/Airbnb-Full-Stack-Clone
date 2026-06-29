const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalMongoose = require("passport-local-mongoose").default;

// passport-local-mongoose will add username and password + hashing  + salting
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
})

userSchema.plugin(passportlocalMongoose);
module.exports = mongoose.model('User',userSchema);