const express = require("express");
const router = express.Router();

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listing.js");  //models
const { listingSchema } = require("../schema.js");  //Validation Schema


// creating a validation function 
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}


//Index Route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
})

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})
// error aarah tha as show route upar tha to /new ko bhi id smajh raha tha browser

//Show Route
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
})

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}))

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}))

//Delete Route
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
})


module.exports = router; 