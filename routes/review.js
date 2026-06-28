const express = require("express");
const router = express.Router({ mergeParams: true });

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");

const { validatereview, isLoggedIn, isReviewAuther } = require("../middleware.js")

//controller
const reviewController = require("../controllers/reviews.js");

//Create Review Route
router.post("/", isLoggedIn, validatereview, wrapAsync(reviewController.createReview))

//Delete Review Route
router.delete("/:reviewId", isReviewAuther , wrapAsync(reviewController.destroyReview))

module.exports = router;