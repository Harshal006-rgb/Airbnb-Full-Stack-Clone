const express = require("express");
const router = express.Router();
const multer = require('multer')
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

//Error Handling Utilities
const wrapAsync = require("../utils/wrapAsync.js");

//Controller
const listingController = require("../controllers/listings.js");

//isLogged in middleware
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// use of router.route to use a common path for all get,post... requests
router
    .route("/")
    //Index Route
    .get(wrapAsync(listingController.index))
    //Create Route
    .post(isLoggedIn, validateListing, upload.single('listing[image]'), wrapAsync(listingController.createListing))
    


//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);
// error aarah tha as show route upar tha to /new ko bhi id smajh raha tha browser

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))


router
    .route("/:id")
    //Show Route
    .get(wrapAsync(listingController.showListing))
    //Update Route
    .put(isLoggedIn, isOwner, upload.single('listing[image]') , validateListing, wrapAsync(listingController.updateListing))
    //Delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))


module.exports = router; 