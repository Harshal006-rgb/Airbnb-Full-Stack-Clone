const express = require("express");
const router = express.Router();

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");   //models
const { reviewSchema } = require("../schema.js"); //Validation Schema




// creating a validation function 
const validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}

//Create Review Route
router.post("/",validatereview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing.id}`);
}))

//Delete Revie Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id,{ $pull : { reviews : reviewId }})  //listing me se remove kiya
    await Review.findByIdAndDelete(reviewId);  //review me se remove kiya
    res.redirect(`/listings/${id}`);
    
}))


module.exports = router;