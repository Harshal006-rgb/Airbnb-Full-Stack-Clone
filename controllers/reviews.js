//Controller callback functions ko separate file mein rakhte hain taaki cleaner code ho
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview =  async (req, res) => {
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
}

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })  //listing me se remove kiya
    await Review.findByIdAndDelete(reviewId);  //review me se remove kiya
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);

}