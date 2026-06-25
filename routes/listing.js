const express = require("express");
const router = express.Router();

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listing.js");  //models
const { listingSchema } = require("../schema.js");  //Validation Schema


//isLogged in middleware
const {isLoggedIn} = require("../middleware.js");


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
router.get("/new",isLoggedIn, (req, res) => {    
    res.render("listings/new.ejs");
})
// error aarah tha as show route upar tha to /new ko bhi id smajh raha tha browser

//Show Route
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error","Listing Does Not Exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
})

//Create Route
router.post("/",isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Is Created!");
    res.redirect("/listings");
}))

//Edit Route
router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))

//Update Route
router.put("/:id",isLoggedIn , validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success","Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}))

//Delete Route
router.delete("/:id",isLoggedIn , async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect(`/listings`);
})


module.exports = router; 