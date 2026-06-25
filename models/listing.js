const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    image: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn2nmWoa-66Yo5xylQwIiAxtvMrK2pB2l4CA&s",
        set: (v) => v === "" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn2nmWoa-66Yo5xylQwIiAxtvMrK2pB2l4CA&s" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


//post mongoose middleware 
listingSchema.post( "findOneAndDelete" , async(listing) =>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;