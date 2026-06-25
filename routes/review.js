const express = require("express");
// mergeparams: true is used to merge the params of the parent router and the child router// eg. 
// /listings/:id/reviews/:reviewId -> here we get both id and reviewId          
const router = express.Router({ mergeParams: true });

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listing.js"); //models
const Review = require("../models/review.js");   //models
const { reviewSchema } = require("../schema.js"); //Validation Schema

const { validatereview, isLoggedIn , isReviewAuther } = require("../middleware.js")

//Create Review Route
router.post("/", isLoggedIn, validatereview, wrapAsync(async (req, res) => {
    // because of merge params: true we can acces id here 
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);

    review.author = req.user._id;

    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "Review Added Successfully!");
    res.redirect(`/listings/${listing.id}`);
}))

//Delete Revie Route
router.delete("/:reviewId", isReviewAuther , wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })  //listing me se remove kiya
    await Review.findByIdAndDelete(reviewId);  //review me se remove kiya
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);

}))


module.exports = router;